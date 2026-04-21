/**
 * KMLParser.js
 * Parses a KML string and extracts camera coordinates.
 * Also provides utility: distance between two lat/lng points (Haversine).
 */

/**
 * Parse a KML string and return array of { name, lat, lng }
 */
export function parseKML(kmlString) {
  const cameras = [];
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlString, "text/xml");
    const placemarks = xmlDoc.querySelectorAll("Placemark");

    placemarks.forEach((placemark) => {
      const nameEl = placemark.querySelector("name");
      const coordsEl = placemark.querySelector("coordinates");

      if (coordsEl) {
        const raw = coordsEl.textContent.trim();
        // KML format: lng,lat,altitude
        const parts = raw.split(",");
        if (parts.length >= 2) {
          const lng = parseFloat(parts[0]);
          const lat = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            cameras.push({
              name: nameEl ? nameEl.textContent.trim() : "Cámara ZBE",
              lat,
              lng,
            });
          }
        }
      }
    });
  } catch (err) {
    console.error("KML parse error:", err);
  }
  return cameras;
}

/**
 * Haversine distance in meters between two lat/lng points
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Checks if any camera is within `threshold` meters of a lat/lng point
 */
export function isNearCamera(lat, lng, cameras, threshold = 30) {
  return cameras.some(
    (cam) => haversineDistance(lat, lng, cam.lat, cam.lng) <= threshold
  );
}

/**
 * Decode a Google Maps encoded polyline into array of {lat, lng}
 */
export function decodePolyline(encoded) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

/**
 * Count how many cameras a route (array of leg steps) passes near
 */
export function countCamerasOnRoute(route, cameras, threshold = 30) {
  if (!route?.legs) return 0;
  let count = 0;
  const triggered = new Set();

  route.legs.forEach((leg) => {
    leg.steps.forEach((step) => {
      const points = decodePolyline(step.polyline.points);
      points.forEach((pt) => {
        cameras.forEach((cam, idx) => {
          if (
            !triggered.has(idx) &&
            haversineDistance(pt.lat, pt.lng, cam.lat, cam.lng) <= threshold
          ) {
            triggered.add(idx);
            count++;
          }
        });
      });
    });
  });
  return count;
}

/**
 * Find which cameras a route passes near (returns array of camera objects)
 */
export function findCamerasOnRoute(route, cameras, threshold = 30) {
  if (!route?.legs) return [];
  const triggered = new Set();

  route.legs.forEach((leg) => {
    leg.steps.forEach((step) => {
      const points = decodePolyline(step.polyline.points);
      points.forEach((pt) => {
        cameras.forEach((cam, idx) => {
          if (
            !triggered.has(idx) &&
            haversineDistance(pt.lat, pt.lng, cam.lat, cam.lng) <= threshold
          ) {
            triggered.add(idx);
          }
        });
      });
    });
  });
  return [...triggered].map((idx) => cameras[idx]);
}
