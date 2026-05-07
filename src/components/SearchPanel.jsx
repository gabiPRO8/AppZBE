import React, { useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";

export default function SearchPanel({
  originText,
  setOriginText,
  destinationText,
  setDestinationText,
  onOriginSelect,
  onDestinationSelect,
  onMyLocation,
  isCalculating,
  onClearDestination,
}) {
  const originRef = useRef(null);
  const destRef = useRef(null);
  const originAutoRef = useRef(null);
  const destAutoRef = useRef(null);

  const handleOriginPlace = () => {
    const place = originAutoRef.current?.getPlace();
    if (place?.geometry) {
      onOriginSelect(place);
      originRef.current?.blur();
    }
  };

  const handleDestPlace = () => {
    const place = destAutoRef.current?.getPlace();
    if (place?.geometry) {
      onDestinationSelect(place);
      destRef.current?.blur();
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-3 pointer-events-none">
      <div
        className="bg-white border border-zbe-border rounded-2xl shadow-card overflow-hidden pointer-events-auto animate-fade-in"
      >
        {/* Title row */}
        <div className="px-4 pt-3 pb-1 flex items-center gap-2 ui-no-select">
          <span className="text-zbe-text text-[13px] font-semibold tracking-wide">
            ZBE-Free Maps · Barcelona
          </span>
          {isCalculating && (
            <div className="ml-auto w-4 h-4 border-2 border-zbe-blue border-t-transparent rounded-full animate-spin-slow" />
          )}
        </div>

        <div className="px-3 pb-3 pt-1 flex flex-col gap-1">
          {/* Origin */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center w-5 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-zbe-blue ring-2 ring-blue-100" />
              <div className="w-px h-3 bg-zbe-border mt-0.5" />
            </div>
            <Autocomplete
              onLoad={(a) => (originAutoRef.current = a)}
              onPlaceChanged={handleOriginPlace}
              options={{
                componentRestrictions: { country: "es" },
                fields: ["geometry", "formatted_address", "name"],
              }}
              className="flex-1"
            >
              <input
                ref={originRef}
                type="text"
                value={originText}
                onChange={(e) => setOriginText(e.target.value)}
                placeholder="Mi ubicación"
                className="w-full bg-transparent text-zbe-text text-[15px] placeholder-zbe-muted outline-none py-2"
              />
            </Autocomplete>
            <button
              onClick={onMyLocation}
              className="flex-shrink-0 w-9 h-9 rounded-full bg-zbe-subtle hover:bg-blue-50 flex items-center justify-center text-zbe-blue transition-colors"
              aria-label="Usar mi ubicación"
              title="Mi ubicación GPS"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-zbe-border/70 mx-2" />

          {/* Destination */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center w-5 flex-shrink-0">
              <div className="w-px h-3 bg-zbe-border mb-0.5" />
              <div className="w-3 h-3 rounded-sm bg-zbe-red rotate-45" />
            </div>
            <Autocomplete
              onLoad={(a) => (destAutoRef.current = a)}
              onPlaceChanged={handleDestPlace}
              options={{
                componentRestrictions: { country: "es" },
                fields: ["geometry", "formatted_address", "name"],
              }}
              className="flex-1"
            >
              <input
                ref={destRef}
                type="text"
                value={destinationText}
                onChange={(e) => setDestinationText(e.target.value)}
                placeholder="¿A dónde vas?"
                className="w-full bg-transparent text-zbe-text text-[15px] font-medium placeholder-zbe-muted outline-none py-2"
              />
            </Autocomplete>
            {destinationText && (
              <button
                onClick={onClearDestination}
                className="flex-shrink-0 w-7 h-7 rounded-full bg-zbe-subtle flex items-center justify-center text-zbe-muted hover:bg-zbe-border/60 transition-colors"
                aria-label="Borrar destino"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
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
