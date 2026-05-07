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
  success: "bg-white text-zbe-green border-green-200",
  warning: "bg-white text-orange-600 border-orange-200",
  error:   "bg-white text-zbe-red border-red-200",
  info:    "bg-white text-zbe-blue border-blue-200",
};

export default function StatusToast({ status }) {
  if (!status) return null;
  return (
    <div className="absolute top-[110px] left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-fade-in px-3">
      <div
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border shadow-card ${COLORS[status.type]}`}
      >
        {ICONS[status.type]}
        <span className="text-[13px] font-medium whitespace-nowrap">{status.message}</span>
      </div>
    </div>
  );
}
