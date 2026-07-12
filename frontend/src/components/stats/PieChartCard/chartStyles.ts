import type React from "react";

export const PIE_DATA_KEY = "value" as const;
export const PIE_NAME_KEY = "name" as const;
export const PIE_CURSOR = "default" as const;
// recharts requires a numeric width/height prop (not CSS); the fallback below reuses it to keep its pixel size in lockstep with the chart
export const PIE_SIZE = 140;

// reserves the donut's footprint while the chart chunk loads, so the page does not jump when it arrives
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

export const TOOLTIP_WRAPPER_STYLE: React.CSSProperties = {
    outline: "none",
};
