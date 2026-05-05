import React from "react";

const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

const COLORS = {
  success: "bg-zbe-green/20 border-zbe-green/30 text-zbe-green",
  warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
  error: "bg-zbe-red/20 border-zbe-red/30 text-zbe-red",
  info: "bg-zbe-blue/20 border-zbe-blue/30 text-zbe-blue",
};

export default function StatusToast({ status }) {
  if (!status) return null;

  return (
    <div className="absolute top-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fade-in w-max max-w-[90vw]">
      <div
        className={`flex items-start gap-2.5 px-4 py-2.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${COLORS[status.type]}`}
        style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.6)" }}
      >
        <span className="flex-shrink-0 mt-0.5">{ICONS[status.type]}</span>
        <span className="text-sm font-medium leading-snug">{status.message}</span>
      </div>
    </div>
  );
}
