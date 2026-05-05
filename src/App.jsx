import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Circle,
  Marker,
} from "@react-google-maps/api";
import { MAP_STYLES, MAP_OPTIONS } from "./MapStyles";
import { countCamerasOnRoute, findCamerasOnRoute } from "./KMLParser";
import SearchPanel from "./components/SearchPanel";
import RouteInfo from "./components/RouteInfo";
import ToggleButton from "./components/ToggleButton";
import StatusToast from "./components/StatusToast";

// Embedded camera data (from zbe-cameras-data.js)
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
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originText, setOriginText] = useState("");
  const [destinationText, setDestinationText] = useState("");
  const [directions, setDirections] = useState(null);
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
  const [panelMinimized, setPanelMinimized] = useState(false);

  // Geolocate on mount
  useEffect(() => {
    if (navigator.geolocation) {
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
    }
  }, []);

  const showStatus = useCallback((type, message, duration = 3500) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), duration);
  }, []);

  const onMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
    setMap(mapInstance);
  }, []);

  // Calculate best route avoiding cameras
  const calculateRoute = useCallback(async () => {
    if (!origin || !destination || !isLoaded) return;
    setIsCalculating(true);
    setDirections(null);
    setRouteInfo(null);
    setCamerasOnRoute([]);
    setRouteOptions([]);

    try {
      const directionsService = new window.google.maps.DirectionsService();

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
        directionsService.route(request, (res, status) => {
          if (status === "OK") resolve(res);
          else reject(new Error(status));
        });
      });

      const routes = result.routes;
      if (!routes || routes.length === 0) {
        throw new Error("No se encontraron rutas");
      }
      setAllRoutes(routes);

      const scored = routes.map((route, idx) => {
        const leg = route.legs[0];
        const cameras = countCamerasOnRoute(route, ZBE_CAMERAS, CAMERA_THRESHOLD_M);
        const durationValue = leg?.duration?.value ?? Number.MAX_SAFE_INTEGER;
        const durationInTrafficValue = leg?.duration_in_traffic?.value ?? durationValue;
        const score =
          durationInTrafficValue +
          (avoidZBE ? cameras * CAMERA_TIME_PENALTY_S : 0);

        return {
          idx,
          route,
          leg,
          cameras,
          durationInTrafficValue,
          score,
          durationText: leg?.duration_in_traffic?.text || leg?.duration?.text || "-",
          distanceText: leg?.distance?.text || "-",
        };
      });

      const ranked = [...scored].sort((a, b) => a.score - b.score);
      const best = ranked[0];

      setDirections(result);
      setSelectedRoute(best.idx);
      setRouteOptions(
        ranked.map((r, rank) => ({
          idx: r.idx,
          rank,
          duration: r.durationText,
          distance: r.distanceText,
          cameras: r.cameras,
        }))
      );

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
      setPanelMinimized(false);

      if (!avoidZBE) {
        showStatus("info", "Ruta mas rapida seleccionada por trafico");
      } else if (best.cameras === 0) {
        showStatus("success", "Ruta rapida sin camaras ZBE");
      } else {
        showStatus(
          "warning",
          `Ruta optimizada: ${best.cameras} camara${best.cameras !== 1 ? "s" : ""} con mejor tiempo total`
        );
      }
    } catch (err) {
      console.error("Route error:", err);
      showStatus("error", `No se pudo calcular la ruta: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  }, [origin, destination, avoidZBE, isLoaded, showStatus]);

  // Auto-calculate when both points set
  useEffect(() => {
    if (origin && destination) {
      calculateRoute();
    }
  }, [origin, destination, avoidZBE]);

  // Center on user location
  const selectRoute = useCallback(
    (routeIdx) => {
      if (!allRoutes.length) return;
      const route = allRoutes[routeIdx];
      if (!route) return;

      const leg = route.legs[0];
      const cameras = countCamerasOnRoute(route, ZBE_CAMERAS, CAMERA_THRESHOLD_M);
      const camsOnSelected = findCamerasOnRoute(route, ZBE_CAMERAS, CAMERA_THRESHOLD_M);

      setSelectedRoute(routeIdx);
      setCamerasOnRoute(camsOnSelected);
      setRouteInfo({
        duration: leg?.duration_in_traffic?.text || leg?.duration?.text || "-",
        distance: leg?.distance?.text || "-",
        cameras,
        avoided: avoidZBE && cameras === 0,
        routeIndex: routeIdx,
        totalRoutes: allRoutes.length,
      });
    },
    [allRoutes, avoidZBE]
  );

  // Center on user location
  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(16);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      const z = mapRef.current.getZoom();
      mapRef.current.setZoom(z + 1);
    }
  };
  const handleZoomOut = () => {
    if (mapRef.current) {
      const z = mapRef.current.getZoom();
      mapRef.current.setZoom(z - 1);
    }
  };

  if (!GOOGLE_API_KEY) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-zbe-dark px-6 text-center">
        <h1 className="text-red-400 text-lg font-semibold">Falta API key de Google Maps</h1>
        <p className="text-white/60 text-sm mt-2">
          Crea un archivo <strong>.env</strong> con <strong>VITE_GOOGLE_MAPS_API_KEY</strong> y reinicia el servidor.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-zbe-dark">
        <div className="w-12 h-12 border-2 border-zbe-blue border-t-transparent rounded-full animate-spin-slow mb-4" />
        <p className="text-white/60 text-sm font-mono tracking-widest uppercase">Cargando mapa…</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-zbe-dark">
      {/* ── MAP ── */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={userLocation || BARCELONA_CENTER}
        zoom={13}
        options={{ ...MAP_OPTIONS, styles: MAP_STYLES }}
        onLoad={onMapLoad}
        onZoomChanged={() => mapRef.current && setMapZoom(mapRef.current.getZoom())}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#007AFF",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            }}
            zIndex={1000}
          />
        )}

        {/* Camera circles */}
        {showCameras &&
          ZBE_CAMERAS.map((cam, i) => (
            <Circle
              key={i}
              center={{ lat: cam.lat, lng: cam.lng }}
              radius={CAMERA_THRESHOLD_M}
              options={{
                fillColor: camerasOnRoute.some(
                  (c) => c.lat === cam.lat && c.lng === cam.lng
                )
                  ? "#FF3B30"
                  : "#FF9500",
                fillOpacity: mapZoom >= 13 ? 0.35 : 0.15,
                strokeColor: camerasOnRoute.some(
                  (c) => c.lat === cam.lat && c.lng === cam.lng
                )
                  ? "#FF3B30"
                  : "#FF9500",
                strokeOpacity: mapZoom >= 13 ? 0.8 : 0.3,
                strokeWeight: 1,
              }}
            />
          ))}

        {/* Route */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            routeIndex={selectedRoute}
            options={{
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: avoidZBE && routeInfo?.cameras === 0 ? "#34C759" : "#007AFF",
                strokeWeight: 5,
                strokeOpacity: 0.9,
              },
              markerOptions: {
                zIndex: 500,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* ── SEARCH PANEL (top) ── */}
      <SearchPanel
        isLoaded={isLoaded}
        originText={originText}
        setOriginText={setOriginText}
        destinationText={destinationText}
        setDestinationText={setDestinationText}
        onOriginSelect={(place) => {
          setOrigin({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
          setOriginText(place.formatted_address || place.name);
        }}
        onDestinationSelect={(place) => {
          setDestination({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
          setDestinationText(place.formatted_address || place.name);
        }}
        onMyLocation={() => {
          if (userLocation) {
            setOrigin(userLocation);
            setOriginText("Mi ubicación");
          }
        }}
        isCalculating={isCalculating}
      />

      {/* ── BOTTOM CONTROLS ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <div className="flex flex-col items-end gap-3 px-4 pb-6 pointer-events-auto">
          {/* Zoom + locate buttons — always visible */}
          <div className="flex flex-col gap-2 items-end">
            <button
              onClick={centerOnUser}
              className="w-11 h-11 bg-zbe-card border border-zbe-border rounded-2xl flex items-center justify-center text-white/70 hover:text-white hover:bg-zbe-border transition-all shadow-2xl"
              aria-label="Ir a mi ubicación"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              </svg>
            </button>
            <div className="flex flex-col bg-zbe-card border border-zbe-border rounded-2xl overflow-hidden shadow-2xl">
              <button onClick={handleZoomIn} className="w-11 h-11 flex items-center justify-center text-white/70 hover:text-white hover:bg-zbe-border transition-all border-b border-zbe-border text-lg font-light">+</button>
              <button onClick={handleZoomOut} className="w-11 h-11 flex items-center justify-center text-white/70 hover:text-white hover:bg-zbe-border transition-all text-lg font-light">−</button>
            </div>
          </div>

          {/* Minimized pill — shown only when panel is minimized and route exists */}
          {routeInfo && panelMinimized && (
            <button
              onClick={() => setPanelMinimized(false)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-zbe-card/95 backdrop-blur-xl border border-zbe-border rounded-3xl shadow-2xl animate-slide-up"
              style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.7)" }}
              aria-label="Expandir panel de ruta"
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                routeInfo.cameras === 0 ? "bg-zbe-green animate-pulse" : routeInfo.cameras <= 2 ? "bg-yellow-400 animate-pulse" : "bg-zbe-red animate-pulse-red"
              }`} />
              <span className="text-white text-sm font-semibold">{routeInfo.duration}</span>
              <span className="text-white/50 text-sm">{routeInfo.distance}</span>
              <span className={`text-xs ml-1 ${routeInfo.cameras === 0 ? "text-zbe-green" : "text-yellow-400"}`}>
                {routeInfo.cameras === 0 ? "Sin cámaras" : `${routeInfo.cameras} cam`}
              </span>
              <svg className="ml-auto text-white/40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </button>
          )}

          {/* Full panel — hidden when minimized */}
          {!panelMinimized && (
            <>
              {/* Toggle ZBE + cameras */}
              <ToggleButton
                avoidZBE={avoidZBE}
                setAvoidZBE={setAvoidZBE}
                showCameras={showCameras}
                setShowCameras={setShowCameras}
                cameraCount={ZBE_CAMERAS.length}
              />

              {/* Route info panel */}
              {routeInfo && (
                <RouteInfo
                  info={routeInfo}
                  avoidZBE={avoidZBE}
                  onRecalculate={calculateRoute}
                  routes={routeOptions}
                  selectedRoute={selectedRoute}
                  onSelectRoute={selectRoute}
                  onMinimize={() => setPanelMinimized(true)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ── STATUS TOAST ── */}
      {status && <StatusToast status={status} />}
    </div>
  );
}
