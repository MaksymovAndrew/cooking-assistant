import type React from "react";

export const PIE_DATA_KEY = "value" as const;
export const PIE_NAME_KEY = "name" as const;
export const PIE_CURSOR = "default" as const;
export const PIE_SIZE = 240;

export const PIE_WRAPPER_STYLE: React.CSSProperties = {
    position: "relative",
    width: PIE_SIZE,
    height: PIE_SIZE,
    cursor: "default",
};

// reserves the donut's footprint while the chart chunk loads, so the page
// does not jump when it arrives
export const CHART_FALLBACK_STYLE: React.CSSProperties = {
    width: PIE_SIZE,
    height: PIE_SIZE,
    margin: "0 auto",
};

export const CHART_CENTERING_STYLE: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
};

export const CENTER_STYLE: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    pointerEvents: "none",
};

export const CENTER_TOTAL_STYLE: React.CSSProperties = {
    display: "block",
    fontSize: 28,
    fontWeight: "bold",
};

export const CENTER_LABEL_STYLE: React.CSSProperties = {
    display: "block",
    fontSize: 12,
};

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

export const LEGEND_WRAPPER_STYLE: React.CSSProperties = {
    marginTop: 8,
    width: PIE_SIZE,
};

export const LEGEND_ITEM_STYLE: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    fontSize: 12,
};

export const RECHARTS_SVG_STYLE: React.CSSProperties = {
    outline: "none",
};

export const LEGEND_DOT_BASE_STYLE: React.CSSProperties = {
    width: 10,
    height: 10,
    borderRadius: 2,
    flexShrink: 0,
    display: "block",
};
