// Ultra-minimal dark map style for ZBE-Free Maps
export const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#0e0e16" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0e0e16" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0f1a0f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#1a3a1a" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1c1c28" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0a0a14" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4b5563" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#22223a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#111120" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#1a1a28" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#0f0f1a" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#374151" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#050510" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#1e3a5f" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#050510" }],
  },
];

export const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: "greedy",
};
