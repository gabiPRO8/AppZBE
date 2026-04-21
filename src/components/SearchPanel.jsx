import React, { useRef, useEffect } from "react";
import { Autocomplete } from "@react-google-maps/api";

export default function SearchPanel({
  isLoaded,
  originText,
  setOriginText,
  destinationText,
  setDestinationText,
  onOriginSelect,
  onDestinationSelect,
  onMyLocation,
  isCalculating,
}) {
  const originRef = useRef(null);
  const destRef = useRef(null);
  const originAutoRef = useRef(null);
  const destAutoRef = useRef(null);

  const handleOriginPlace = () => {
    if (originAutoRef.current) {
      const place = originAutoRef.current.getPlace();
      if (place?.geometry) {
        onOriginSelect(place);
        if (originRef.current) originRef.current.blur();
      }
    }
  };

  const handleDestPlace = () => {
    if (destAutoRef.current) {
      const place = destAutoRef.current.getPlace();
      if (place?.geometry) {
        onDestinationSelect(place);
        if (destRef.current) destRef.current.blur();
      }
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-10 px-3 pt-3 pb-2 pointer-events-none">
      <div
        className="bg-zbe-card/95 backdrop-blur-xl border border-zbe-border rounded-3xl shadow-2xl overflow-hidden pointer-events-auto animate-fade-in"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.7)" }}
      >
        {/* Header */}
        <div className="px-4 pt-3 pb-1 flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-zbe-red" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-zbe-green" />
          </div>
          <span className="text-white/40 text-xs font-mono tracking-widest uppercase ml-1">
            ZBE-Free Maps · Barcelona
          </span>
          {isCalculating && (
            <div className="ml-auto w-4 h-4 border border-zbe-blue border-t-transparent rounded-full animate-spin-slow" />
          )}
        </div>

        <div className="px-3 pb-3 flex flex-col gap-2">
          {/* Origin */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1 w-5 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-zbe-blue border-2 border-white/20" />
              <div className="w-px h-3 bg-zbe-border" />
            </div>
            <Autocomplete
              onLoad={(a) => (originAutoRef.current = a)}
              onPlaceChanged={handleOriginPlace}
              options={{
                componentRestrictions: { country: "es" },
                fields: ["geometry", "formatted_address", "name"],
              }}
            >
              <input
                ref={originRef}
                type="text"
                value={originText}
                onChange={(e) => setOriginText(e.target.value)}
                placeholder="Origen…"
                className="w-full bg-transparent text-white text-sm placeholder-white/30 outline-none py-1"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </Autocomplete>
            <button
              onClick={onMyLocation}
              className="flex-shrink-0 w-7 h-7 rounded-xl bg-zbe-blue/10 flex items-center justify-center text-zbe-blue hover:bg-zbe-blue/20 transition-all"
              aria-label="Usar mi ubicación"
              title="Mi ubicación GPS"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="w-5 flex justify-center">
              <div className="w-px h-4 bg-zbe-border" />
            </div>
            <div className="flex-1 h-px bg-zbe-border/50" />
          </div>

          {/* Destination */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1 w-5 flex-shrink-0">
              <div className="w-px h-3 bg-zbe-border" />
              <div className="w-2.5 h-2.5 rounded-sm bg-zbe-red border-2 border-white/20 rotate-45" />
            </div>
            <Autocomplete
              onLoad={(a) => (destAutoRef.current = a)}
              onPlaceChanged={handleDestPlace}
              options={{
                componentRestrictions: { country: "es" },
                fields: ["geometry", "formatted_address", "name"],
              }}
            >
              <input
                ref={destRef}
                type="text"
                value={destinationText}
                onChange={(e) => setDestinationText(e.target.value)}
                placeholder="¿A dónde vas?"
                className="w-full bg-transparent text-white text-sm placeholder-white/30 outline-none py-1 font-medium"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </Autocomplete>
            {destinationText && (
              <button
                onClick={() => {
                  setDestinationText("");
                }}
                className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
