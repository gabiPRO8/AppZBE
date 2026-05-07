import React from "react";

function Row({ icon, title, subtitle, on, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zbe-subtle transition-colors"
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}
        style={{ background: on ? `${accent}1A` : "#F1F3F4" }}
      >
        {icon(on ? accent : "#9AA0A6")}
      </div>

      <div className="flex-1 text-left">
        <p className={`text-[14px] font-semibold leading-tight ${on ? "text-zbe-text" : "text-zbe-muted"}`}>
          {title}
        </p>
        <p className="text-[12px] mt-0.5 text-zbe-muted">{subtitle}</p>
      </div>

      <div
        className={`w-11 h-6 rounded-full transition-colors duration-300 flex items-center flex-shrink-0`}
        style={{ background: on ? accent : "#DADCE0" }}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}

export default function ToggleButton({
  avoidZBE,
  setAvoidZBE,
  showCameras,
  setShowCameras,
  cameraCount,
}) {
  return (
    <div className="bg-white border border-zbe-border rounded-2xl shadow-card overflow-hidden">
      <Row
        on={avoidZBE}
        onClick={() => setAvoidZBE(!avoidZBE)}
        accent="#1E8E3E"
        title="Evitar Cámaras ZBE"
        subtitle={avoidZBE ? `Activo · ${cameraCount} cámaras` : "Desactivado"}
        icon={(c) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M4.93 4.93l14.14 14.14"/>
          </svg>
        )}
      />
      <div className="mx-4 h-px bg-zbe-border" />
      <Row
        on={showCameras}
        onClick={() => setShowCameras(!showCameras)}
        accent="#F29900"
        title="Ver Cámaras en Mapa"
        subtitle={showCameras ? "Círculos naranja/rojo" : "Ocultas"}
        icon={(c) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        )}
      />
    </div>
  );
}
