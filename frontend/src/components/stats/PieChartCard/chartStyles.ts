import type React from "react";

export const PIE_DATA_KEY = "value" as const;
export const PIE_NAME_KEY = "name" as const;
export const PIE_CURSOR = "default" as const;
// recharts takes numeric sizes, not CSS; the fallback shares this to match the chart
export const PIE_SIZE = 140;

export const CHART_FALLBACK_STYLE: React.CSSProperties = {
    width: PIE_SIZE,
    height: PIE_SIZE,
};

// recharts' Tooltip only accepts style objects via these two props, not a className
export const TOOLTIP_CONTENT_STYLE: React.CSSProperties = {
    border: "none",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    fontSize: 13,
    padding: "6px 10px",
};

// above the donut's center label, which comes later in the DOM and would paint over it
export const TOOLTIP_WRAPPER_STYLE: React.CSSProperties = {
    outline: "none",
    zIndex: 1,
};
