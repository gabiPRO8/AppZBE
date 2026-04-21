import React from "react";

export default function RouteInfo({
  info,
  avoidZBE,
  onRecalculate,
  routes = [],
  selectedRoute = 0,
  onSelectRoute,
}) {
  const { duration, distance, cameras, totalRoutes } = info;

  return (
    <div
      className="w-full bg-zbe-card/95 backdrop-blur-xl border border-zbe-border rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.7)" }}
    >
      {/* Status bar */}
      <div
        className={`px-4 py-2.5 flex items-center gap-2 ${
          !avoidZBE
            ? "bg-white/5"
            : cameras === 0
            ? "bg-zbe-green/10"
            : cameras <= 2
            ? "bg-yellow-500/10"
            : "bg-zbe-red/10"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            !avoidZBE
              ? "bg-zbe-blue"
              : cameras === 0
              ? "bg-zbe-green animate-pulse"
              : cameras <= 2
              ? "bg-yellow-400 animate-pulse"
              : "bg-zbe-red animate-pulse-red"
          }`}
        />
        <p
          className={`text-xs font-semibold tracking-wide uppercase ${
            !avoidZBE
              ? "text-zbe-blue/80"
              : cameras === 0
              ? "text-zbe-green"
              : cameras <= 2
              ? "text-yellow-400"
              : "text-zbe-red"
          }`}
        >
          {!avoidZBE
            ? "Ruta estándar"
            : cameras === 0
            ? "✓ Sin cámaras ZBE"
            : cameras === 1
            ? `⚠ 1 cámara en ruta`
            : `⚠ ${cameras} cámaras en ruta`}
        </p>
        {totalRoutes > 1 && (
          <span className="ml-auto text-white/20 text-xs font-mono">
            {totalRoutes} alt.
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-3 flex items-center gap-4">
        {/* Duration */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="text-white text-base font-semibold">{duration}</span>
        </div>

        <div className="w-px h-5 bg-zbe-border" />

        {/* Distance */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
          <span className="text-white/70 text-base">{distance}</span>
        </div>

        <div className="flex-1" />

        {/* Recalculate */}
        <button
          onClick={onRecalculate}
          className="w-9 h-9 rounded-2xl bg-zbe-blue/10 flex items-center justify-center text-zbe-blue hover:bg-zbe-blue/20 transition-all"
          aria-label="Recalcular ruta"
          title="Recalcular"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      {/* Camera warning detail */}
      {avoidZBE && cameras > 0 && (
        <div className="px-4 pb-3">
          <div className="bg-zbe-red/5 border border-zbe-red/20 rounded-2xl px-3 py-2 flex items-start gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="text-zbe-red/80 text-xs leading-snug">
              Esta es la ruta con <strong className="text-zbe-red">{cameras} {cameras === 1 ? "cámara" : "cámaras"}</strong> — la mejor disponible. Considera ajustar el origen o destino.
            </p>
          </div>
        </div>
      )}

      {/* Alternative routes */}
      {routes.length > 1 && (
        <div className="px-4 pb-4">
          <div className="border border-zbe-border rounded-2xl overflow-hidden">
            <div className="px-3 py-2 text-[11px] tracking-wide uppercase text-white/40 bg-white/5">
              Rutas alternativas
            </div>
            <div className="divide-y divide-zbe-border/70">
              {routes.map((route) => {
                const isActive = route.idx === selectedRoute;
                return (
                  <button
                    key={route.idx}
                    onClick={() => onSelectRoute && onSelectRoute(route.idx)}
                    className={`w-full px-3 py-2.5 text-left transition-all ${
                      isActive ? "bg-zbe-blue/15" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${
                          isActive
                            ? "text-zbe-blue bg-zbe-blue/20"
                            : "text-white/50 bg-white/10"
                        }`}
                      >
                        {route.rank === 0 ? "Mejor" : `Alt ${route.rank + 1}`}
                      </span>
                      <span className="text-sm font-semibold text-white">{route.duration}</span>
                      <span className="text-xs text-white/60">{route.distance}</span>
                      <span
                        className={`ml-auto text-xs ${
                          route.cameras === 0 ? "text-zbe-green" : "text-yellow-400"
                        }`}
                      >
                        {route.cameras} cam
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
