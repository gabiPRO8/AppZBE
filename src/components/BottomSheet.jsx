import React, { useEffect, useRef, useState, useCallback } from "react";

const PEEK_HEIGHT = 96;       // visible when collapsed
const EXPANDED_OFFSET = 56;   // distance from top when fully expanded

/**
 * Google-Maps-style draggable bottom sheet.
 * State: "collapsed" | "expanded"
 * Drag handle (or the whole header strip) lets the user drag up/down.
 */
export default function BottomSheet({
  open,
  state,
  onStateChange,
  routeInfo,
  routes,
  selectedRoute,
  onSelectRoute,
  avoidZBE,
  onRecalculate,
  onStart,
}) {
  const sheetRef = useRef(null);
  const dragRef = useRef(null);
  const [translateY, setTranslateY] = useState(0);
  const [dragging, setDragging] = useState(0); // 0 = no, 1 = yes

  const computeY = useCallback(
    (s) => {
      const h = sheetRef.current?.offsetHeight || 0;
      if (s === "collapsed") return Math.max(0, h - PEEK_HEIGHT);
      return 0; // expanded
    },
    []
  );

  // Keep translate in sync with state when not actively dragging
  useEffect(() => {
    if (!sheetRef.current) return;
    if (!dragging) setTranslateY(computeY(state));
  }, [state, dragging, computeY, routes?.length, routeInfo]);

  // Recompute on resize
  useEffect(() => {
    const onResize = () => {
      if (!dragging) setTranslateY(computeY(state));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [state, dragging, computeY]);

  const onPointerDown = (e) => {
    if (!sheetRef.current) return;
    const point = e.touches ? e.touches[0] : e;
    dragRef.current = {
      startY: point.clientY,
      startTranslate: translateY,
    };
    setDragging(1);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current || !sheetRef.current) return;
    const point = e.touches ? e.touches[0] : e;
    const delta = point.clientY - dragRef.current.startY;
    const h = sheetRef.current.offsetHeight;
    const max = Math.max(0, h - PEEK_HEIGHT);
    const next = Math.min(max, Math.max(0, dragRef.current.startTranslate + delta));
    setTranslateY(next);
  };

  const onPointerUp = () => {
    if (!dragRef.current || !sheetRef.current) {
      setDragging(0);
      return;
    }
    const h = sheetRef.current.offsetHeight;
    const max = Math.max(0, h - PEEK_HEIGHT);
    const next = translateY > max / 2 ? "collapsed" : "expanded";
    dragRef.current = null;
    setDragging(0);
    if (next !== state) onStateChange(next);
    else setTranslateY(computeY(state)); // snap back
  };

  // Bind global listeners while dragging
  useEffect(() => {
    if (!dragging) return;
    const move = (e) => onPointerMove(e);
    const up = () => onPointerUp();
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", up);
    window.addEventListener("touchcancel", up);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
      window.removeEventListener("touchcancel", up);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging]); // eslint-disable-line

  if (!open) return null;

  const cameras = routeInfo?.cameras ?? 0;
  const statusColor = !avoidZBE
    ? "bg-zbe-blue"
    : cameras === 0
    ? "bg-zbe-green"
    : cameras <= 2
    ? "bg-orange-500"
    : "bg-zbe-red";
  const statusText = !avoidZBE
    ? "Ruta estándar"
    : cameras === 0
    ? "✓ Sin cámaras ZBE"
    : `⚠ ${cameras} cámara${cameras !== 1 ? "s" : ""} en ruta`;

  return (
    <section
      ref={sheetRef}
      className="fixed left-0 right-0 bottom-0 z-30 bg-white rounded-t-2xl shadow-sheet ui-no-select"
      style={{
        top: `${EXPANDED_OFFSET}px`,
        transform: `translateY(${translateY}px)`,
        transition: dragging ? "none" : "transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
        touchAction: "none",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      onTouchStart={(e) => {
        // Drag from anywhere except scrollable list while expanded
        const target = e.target;
        if (state === "expanded" && target.closest && target.closest("[data-scroll]")) {
          // allow scroll inside; only handle drag via handle area
          if (!target.closest("[data-handle]")) return;
        }
        onPointerDown(e);
      }}
      onMouseDown={(e) => {
        const target = e.target;
        if (state === "expanded" && target.closest && target.closest("[data-scroll]")) {
          if (!target.closest("[data-handle]")) return;
        }
        onPointerDown(e);
      }}
    >
      {/* Handle */}
      <div data-handle className="cursor-grab active:cursor-grabbing">
        <div className="sheet-handle" />
      </div>

      {/* Peek area: always visible */}
      <div className="px-4 pt-1 pb-3" data-handle>
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor} ${cameras > 0 && avoidZBE ? "animate-pulse-blue" : ""}`} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-zbe-text truncate">{statusText}</p>
            <p className="text-[12px] text-zbe-muted">
              {routeInfo?.duration ?? "–"} · {routeInfo?.distance ?? "–"}
              {routes?.length > 1 && (
                <span className="ml-2 text-zbe-muted/80">{routes.length} alt.</span>
              )}
            </p>
          </div>
          <button
            onClick={onStart}
            className="px-4 h-9 rounded-full bg-zbe-blue text-white text-[13px] font-semibold shadow-card hover:bg-blue-700 transition-colors"
          >
            Iniciar
          </button>
        </div>
      </div>

      {/* Expanded content */}
      <div
        data-scroll
        className="px-4 pb-4 overflow-y-auto"
        style={{
          maxHeight: `calc(100vh - ${EXPANDED_OFFSET}px - ${PEEK_HEIGHT}px - env(safe-area-inset-bottom))`,
          touchAction: "pan-y",
        }}
        onTouchStart={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Camera warning */}
        {avoidZBE && cameras > 0 && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-start gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="text-[12px] text-red-700 leading-snug">
              Esta ruta pasa por <strong>{cameras} {cameras === 1 ? "cámara" : "cámaras"}</strong> — la mejor disponible.
            </p>
          </div>
        )}

        {/* Routes list */}
        {routes?.length > 0 && (
          <div className="border border-zbe-border rounded-xl overflow-hidden bg-white">
            <div className="flex items-center justify-between px-3 py-2 bg-zbe-subtle">
              <span className="text-[11px] tracking-wide uppercase text-zbe-muted font-semibold">
                Rutas alternativas
              </span>
              <button
                onClick={onRecalculate}
                className="text-zbe-blue text-[11px] font-semibold uppercase tracking-wide hover:underline"
              >
                Recalcular
              </button>
            </div>
            <div className="divide-y divide-zbe-border">
              {routes.map((r) => {
                const active = r.idx === selectedRoute;
                return (
                  <button
                    key={r.idx}
                    onClick={() => onSelectRoute(r.idx)}
                    className={`w-full px-3 py-3 text-left transition-colors ${
                      active ? "bg-blue-50" : "hover:bg-zbe-subtle"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                          active
                            ? "text-white bg-zbe-blue"
                            : "text-zbe-muted bg-zbe-bg"
                        }`}
                      >
                        {r.rank === 0 ? "Mejor" : `Alt ${r.rank + 1}`}
                      </span>
                      <span className="text-[15px] font-bold text-zbe-text">{r.duration}</span>
                      <span className="text-[13px] text-zbe-muted">{r.distance}</span>
                      <span
                        className={`ml-auto text-[12px] font-semibold ${
                          r.cameras === 0 ? "text-zbe-green" : "text-orange-600"
                        }`}
                      >
                        {r.cameras} cam
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
