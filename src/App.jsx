import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Circle,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { MAP_STYLES, MAP_OPTIONS } from "./MapStyles";
import { countCamerasOnRoute, findCamerasOnRoute, decodePolyline } from "./KMLParser";
import SearchPanel from "./components/SearchPanel";
import BottomSheet from "./components/BottomSheet";
import ToggleButton from "./components/ToggleButton";
import StatusToast from "./components/StatusToast";
import { ZBE_CAMERAS } from "./data/cameras";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const LIBRARIES = ["places"];
const BARCELONA_CENTER = { lat: 41.3874, lng: 2.1686 };
const CAMERA_THRESHOLD_M = 30;
const CAMERA_TIME_PENALTY_S = Number(import.meta.env.VITE_CAMERA_TIME_PENALTY_S ?? 180);

export default function App() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_API_KEY || "",
    libraries: LIBRARIES,
  });

  const mapRef = useRef(null);
  const [, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originText, setOriginText] = useState("");
  const [destinationText, setDestinationText] = useState("");
  const [avoidZBE, setAvoidZBE] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);
  const [status, setStatus] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showCameras, setShowCameras] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [allRoutes, setAllRoutes] = useState([]);
  const [routeOptions, setRouteOptions] = useState([]);
  const [camerasOnRoute, setCamerasOnRoute] = useState([]);
  const [mapZoom, setMapZoom] = useState(13);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetState, setSheetState] = useState("collapsed"); // "collapsed" | "expanded"

  // Geolocate on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setOrigin(loc);
        setOriginText("Mi ubicación");
      },
      () => {
        setUserLocation(BARCELONA_CENTER);
        setOrigin(BARCELONA_CENTER);
        setOriginText("Barcelona, España");
        showStatus("warning", "No se pudo obtener tu ubicación GPS");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []); // eslint-disable-line

  const showStatus = useCallback((type, message, duration = 3500) => {
    setStatus({ type, message });
    window.setTimeout(() => setStatus(null), duration);
  }, []);

  const onMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
    setMap(mapInstance);
  }, []);

  // Fit bounds helper
  const fitToRoute = useCallback((route) => {
    if (!route || !mapRef.current) return;
    const bounds = new window.google.maps.LatLngBounds();
    route.legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        decodePolyline(step.polyline.points).forEach((p) =>
          bounds.extend({ lat: p.lat, lng: p.lng })
        );
      });
    });
    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, { top: 160, bottom: 220, left: 40, right: 40 });
    }
  }, []);

  // Calculate routes
  const calculateRoute = useCallback(async () => {
    if (!origin || !destination || !isLoaded) return;
    setIsCalculating(true);
    setRouteInfo(null);
    setCamerasOnRoute([]);
    setRouteOptions([]);
    setAllRoutes([]);

    try {
      const ds = new window.google.maps.DirectionsService();
      const request = {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: window.google.maps.TrafficModel.BEST_GUESS,
        },
      };

      const result = await new Promise((resolve, reject) => {
        ds.route(request, (res, st) => (st === "OK" ? resolve(res) : reject(new Error(st))));
      });

      const routes = result.routes;
      if (!routes?.length) throw new Error("No se encontraron rutas");

      const scored = routes.map((route, idx) => {
        const leg = route.legs[0];
        const cameras = countCamerasOnRoute(route, ZBE_CAMERAS, CAMERA_THRESHOLD_M);
        const dur = leg?.duration?.value ?? Number.MAX_SAFE_INTEGER;
        const durTraffic = leg?.duration_in_traffic?.value ?? dur;
        const score = durTraffic + (avoidZBE ? cameras * CAMERA_TIME_PENALTY_S : 0);
        return {
          idx,
          route,
          leg,
          cameras,
          score,
          durationText: leg?.duration_in_traffic?.text || leg?.duration?.text || "-",
          distanceText: leg?.distance?.text || "-",
        };
      });

      const ranked = [...scored].sort((a, b) => a.score - b.score);
      const best = ranked[0];

      setAllRoutes(routes);
      setSelectedRoute(best.idx);
      const opts = ranked.map((r, rank) => ({
        idx: r.idx,
        rank,
        duration: r.durationText,
        distance: r.distanceText,
        cameras: r.cameras,
      }));
      setRouteOptions(opts);

      const camsOnBest = findCamerasOnRoute(best.route, ZBE_CAMERAS, CAMERA_THRESHOLD_M);
      setCamerasOnRoute(camsOnBest);
      setRouteInfo({
        duration: best.durationText,
        distance: best.distanceText,
        cameras: best.cameras,
        avoided: avoidZBE && best.cameras === 0,
        routeIndex: best.idx,
        totalRoutes: routes.length,
      });

      setSheetOpen(true);
      setSheetState("collapsed");
      fitToRoute(best.route);

      if (!avoidZBE) showStatus("info", "Ruta más rápida por tráfico");
      else if (best.cameras === 0) showStatus("success", "Ruta sin cámaras ZBE");
      else
        showStatus(
          "warning",
          `Ruta optimizada: ${best.cameras} cámara${best.cameras !== 1 ? "s" : ""}`
        );
    } catch (err) {
      console.error(err);
      showStatus("error", `No se pudo calcular la ruta: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  }, [origin, destination, avoidZBE, isLoaded, fitToRoute, showStatus]);

  // Auto-calculate when both points set
  useEffect(() => {
    if (origin && destination) calculateRoute();
  }, [origin, destination, avoidZBE]); // eslint-disable-line

  // Select alternative route (from list OR map polyline click)
  const selectRoute = useCallback(
    (routeIdx) => {
      const route = allRoutes[routeIdx];
      if (!route) return;
      const leg = route.legs[0];
      const cameras = countCamerasOnRoute(route, ZBE_CAMERAS, CAMERA_THRESHOLD_M);
      const cams = findCamerasOnRoute(route, ZBE_CAMERAS, CAMERA_THRESHOLD_M);

      setSelectedRoute(routeIdx);
      setCamerasOnRoute(cams);
      setRouteInfo((prev) => ({
        ...(prev || {}),
        duration: leg?.duration_in_traffic?.text || leg?.duration?.text || "-",
        distance: leg?.distance?.text || "-",
        cameras,
        avoided: avoidZBE && cameras === 0,
        routeIndex: routeIdx,
        totalRoutes: allRoutes.length,
      }));
      fitToRoute(route);
    },
    [allRoutes, avoidZBE, fitToRoute]
  );

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(16);
    }
  };

  const handleZoomIn = () => mapRef.current && mapRef.current.setZoom((mapRef.current.getZoom() || 13) + 1);
  const handleZoomOut = () => mapRef.current && mapRef.current.setZoom((mapRef.current.getZoom() || 13) - 1);

  // Pre-decode polylines for each route (memoized) so we can render them all
  const decodedRoutes = useMemo(() => {
    return allRoutes.map((route) => {
      const path = [];
      route.legs.forEach((leg) => {
        leg.steps.forEach((step) => {
          decodePolyline(step.polyline.points).forEach((p) => path.push(p));
        });
      });
      return path;
    });
  }, [allRoutes]);

  if (!GOOGLE_API_KEY) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-zbe-bg px-6 text-center">
        <h1 className="text-zbe-red text-lg font-semibold">Falta API key de Google Maps</h1>
        <p className="text-zbe-muted text-sm mt-2">
          Crea un archivo <strong>.env</strong> con <strong>VITE_GOOGLE_MAPS_API_KEY</strong> y reinicia el servidor.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-zbe-bg">
        <div className="w-10 h-10 border-2 border-zbe-blue border-t-transparent rounded-full animate-spin-slow mb-4" />
        <p className="text-zbe-muted text-sm tracking-wide uppercase">Cargando mapa…</p>
      </div>
    );
  }

  const onDestinationSelect = (place) => {
    setDestination({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
    setDestinationText(place.formatted_address || place.name);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-zbe-bg">
      {/* MAP */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={userLocation || BARCELONA_CENTER}
        zoom={13}
        options={{ ...MAP_OPTIONS, styles: MAP_STYLES }}
        onLoad={onMapLoad}
        onZoomChanged={() => mapRef.current && setMapZoom(mapRef.current.getZoom())}
      >
        {/* User dot */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#1A73E8",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 3,
            }}
            zIndex={1000}
          />
        )}

        {/* Camera circles */}
        {showCameras &&
          ZBE_CAMERAS.map((cam, i) => {
            const onSel = camerasOnRoute.some(
              (c) => c.lat === cam.lat && c.lng === cam.lng
            );
            return (
              <Circle
                key={i}
                center={{ lat: cam.lat, lng: cam.lng }}
                radius={CAMERA_THRESHOLD_M}
                options={{
                  fillColor: onSel ? "#EA4335" : "#F29900",
                  fillOpacity: mapZoom >= 13 ? 0.3 : 0.12,
                  strokeColor: onSel ? "#EA4335" : "#F29900",
                  strokeOpacity: mapZoom >= 13 ? 0.85 : 0.35,
                  strokeWeight: 1,
                  clickable: false,
                }}
              />
            );
          })}

        {/* Render all alternative routes — click to select */}
        {decodedRoutes.map((path, idx) => {
          const isSelected = idx === selectedRoute;
          // Draw a thick "halo" + thin line for the selected route
          if (isSelected) {
            return (
              <React.Fragment key={`route-${idx}`}>
                <Polyline
                  path={path}
                  options={{
                    strokeColor: "#FFFFFF",
                    strokeOpacity: 0.9,
                    strokeWeight: 9,
                    zIndex: 49,
                    clickable: false,
                  }}
                />
                <Polyline
                  path={path}
                  options={{
                    strokeColor:
                      avoidZBE && routeInfo?.cameras === 0 ? "#1E8E3E" : "#1A73E8",
                    strokeOpacity: 1,
                    strokeWeight: 6,
                    zIndex: 50,
                    clickable: false,
                  }}
                />
              </React.Fragment>
            );
          }
          return (
            <Polyline
              key={`route-${idx}`}
              path={path}
              onClick={() => selectRoute(idx)}
              options={{
                strokeColor: "#9AA0A6",
                strokeOpacity: 0.85,
                strokeWeight: 5,
                zIndex: 30,
                clickable: true,
              }}
            />
          );
        })}

        {/* Origin / destination markers */}
        {origin && allRoutes.length > 0 && (
          <Marker
            position={origin}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: "#1A73E8",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 3,
            }}
            zIndex={900}
          />
        )}
        {destination && (
          <Marker
            position={destination}
            zIndex={950}
          />
        )}
      </GoogleMap>

      {/* SEARCH PANEL */}
      <SearchPanel
        originText={originText}
        setOriginText={setOriginText}
        destinationText={destinationText}
        setDestinationText={setDestinationText}
        onOriginSelect={(place) => {
          setOrigin({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
          setOriginText(place.formatted_address || place.name);
        }}
        onDestinationSelect={onDestinationSelect}
        onMyLocation={() => {
          if (userLocation) {
            setOrigin(userLocation);
            setOriginText("Mi ubicación");
          }
        }}
        onClearDestination={() => {
          setDestinationText("");
          setDestination(null);
          setAllRoutes([]);
          setRouteOptions([]);
          setRouteInfo(null);
          setCamerasOnRoute([]);
          setSheetOpen(false);
        }}
        isCalculating={isCalculating}
      />

      {/* RIGHT-SIDE FAB STACK (zoom + locate) */}
      <div
        className="absolute right-3 z-10 flex flex-col items-end gap-2 pointer-events-auto"
        style={{
          bottom: sheetOpen
            ? sheetState === "expanded"
              ? "62vh"
              : "112px"
            : "calc(20px + env(safe-area-inset-bottom))",
          transition: "bottom 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="flex flex-col bg-white border border-zbe-border rounded-2xl shadow-card overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-11 h-11 flex items-center justify-center text-zbe-text hover:bg-zbe-subtle border-b border-zbe-border"
            aria-label="Acercar"
          >
            <span className="text-xl leading-none">+</span>
          </button>
          <button
            onClick={handleZoomOut}
            className="w-11 h-11 flex items-center justify-center text-zbe-text hover:bg-zbe-subtle"
            aria-label="Alejar"
          >
            <span className="text-xl leading-none">−</span>
          </button>
        </div>
        <button
          onClick={centerOnUser}
          className="w-11 h-11 bg-white border border-zbe-border rounded-full flex items-center justify-center text-zbe-blue hover:bg-zbe-subtle shadow-card"
          aria-label="Centrar en mi ubicación"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
      </div>

      {/* TOGGLES — above the sheet when collapsed; hidden while expanded */}
      {(!sheetOpen || sheetState === "collapsed") && (
        <div
          className="absolute left-3 right-3 z-10 pointer-events-auto"
          style={{
            bottom: sheetOpen ? "112px" : "calc(20px + env(safe-area-inset-bottom))",
            transition: "bottom 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <ToggleButton
            avoidZBE={avoidZBE}
            setAvoidZBE={setAvoidZBE}
            showCameras={showCameras}
            setShowCameras={setShowCameras}
            cameraCount={ZBE_CAMERAS.length}
          />
        </div>
      )}

      {/* BOTTOM SHEET */}
      <BottomSheet
        open={sheetOpen}
        state={sheetState}
        onStateChange={setSheetState}
        routeInfo={routeInfo}
        routes={routeOptions}
        selectedRoute={selectedRoute}
        onSelectRoute={selectRoute}
        avoidZBE={avoidZBE}
        onRecalculate={calculateRoute}
        onStart={() => {
          if (!destination || !origin) return;
          const url =
            "https://www.google.com/maps/dir/?api=1" +
            `&origin=${origin.lat},${origin.lng}` +
            `&destination=${destination.lat},${destination.lng}` +
            "&travelmode=driving";
          window.open(url, "_blank");
        }}
      />

      {/* TOAST */}
      {status && <StatusToast status={status} />}
    </div>
  );
}
