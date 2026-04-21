import React from "react";

export default function ToggleButton({
  avoidZBE,
  setAvoidZBE,
  showCameras,
  setShowCameras,
  cameraCount,
}) {
  return (
    <div className="bg-zbe-card/95 backdrop-blur-xl border border-zbe-border rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.7)" }}
    >
      {/* Avoid ZBE toggle */}
      <button
        onClick={() => setAvoidZBE(!avoidZBE)}
        className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
          avoidZBE
            ? "bg-gradient-to-r from-zbe-green/10 to-transparent"
            : "hover:bg-white/5"
        }`}
      >
        {/* Icon */}
        <div
          className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
            avoidZBE ? "bg-zbe-green/20" : "bg-white/5"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={avoidZBE ? "#34C759" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M4.93 4.93l14.14 14.14"/>
          </svg>
        </div>

        <div className="flex-1 text-left">
          <p className={`text-sm font-semibold leading-tight ${avoidZBE ? "text-white" : "text-white/50"}`}>
            Evitar Cámaras ZBE
          </p>
          <p className={`text-xs mt-0.5 ${avoidZBE ? "text-zbe-green" : "text-white/30"}`}>
            {avoidZBE ? `Activo · ${cameraCount} cámaras` : "Desactivado"}
          </p>
        </div>

        {/* Toggle pill */}
        <div
          className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center flex-shrink-0 ${
            avoidZBE ? "bg-zbe-green" : "bg-white/10"
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
              avoidZBE ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </div>
      </button>

      {/* Divider */}
      <div className="mx-4 h-px bg-zbe-border" />

      {/* Show cameras toggle */}
      <button
        onClick={() => setShowCameras(!showCameras)}
        className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
          showCameras ? "hover:bg-white/5" : "hover:bg-white/5"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
            showCameras ? "bg-orange-500/20" : "bg-white/5"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showCameras ? "#FF9500" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>

        <div className="flex-1 text-left">
          <p className={`text-sm font-medium leading-tight ${showCameras ? "text-white/80" : "text-white/40"}`}>
            Ver Cámaras en Mapa
          </p>
          <p className={`text-xs mt-0.5 ${showCameras ? "text-orange-400/70" : "text-white/20"}`}>
            {showCameras ? "Círculos naranja/rojo" : "Ocultas"}
          </p>
        </div>

        <div
          className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center flex-shrink-0 ${
            showCameras ? "bg-orange-500" : "bg-white/10"
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
              showCameras ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </div>
      </button>
    </div>
  );
}
