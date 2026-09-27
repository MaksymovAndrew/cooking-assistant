import type { CSSProperties } from "react";

// the image renderer reads no stylesheet and no custom properties, so these mirror the dark
// theme in styles/_tokens.scss by value
export const SOCIAL_COLORS = {
    bg: "#15131a",
    surface: "#1e1b26",
    surface2: "#2a2533",
    brand: "#8e72cc",
    accent: "#b692c2",
    text: "#f4f1f8",
    text2: "#b4adc2",
};

export const SOCIAL_FONTS = { display: "Fraunces, Lora", body: "Inter" };

export const MARK_SIZE = 56;
export const WATERMARK_SIZE = 420;

export const cardStyle: CSSProperties = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    padding: "64px 80px",
    color: SOCIAL_COLORS.text,
    fontFamily: SOCIAL_FONTS.body,
    backgroundColor: SOCIAL_COLORS.bg,
    backgroundImage: `linear-gradient(135deg, ${SOCIAL_COLORS.surface} 0%, ${SOCIAL_COLORS.bg} 70%)`,
};

export const watermarkStyle: CSSProperties = {
    position: "absolute",
    right: -70,
    bottom: -110,
    display: "flex",
    color: SOCIAL_COLORS.brand,
    opacity: 0.12,
};

export const brandRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 18,
    color: SOCIAL_COLORS.brand,
    fontFamily: SOCIAL_FONTS.display,
    fontSize: 34,
};

export const brandNameStyle: CSSProperties = { color: SOCIAL_COLORS.text };

export const bodyStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    flexGrow: 1,
    maxWidth: 940,
    gap: 20,
};

export const eyebrowStyle: CSSProperties = {
    color: SOCIAL_COLORS.accent,
    fontSize: 26,
    fontWeight: 600,
    letterSpacing: 3,
    textTransform: "uppercase",
};

export const titleStyle: CSSProperties = {
    display: "block",
    fontFamily: SOCIAL_FONTS.display,
    // Lora, the Cyrillic fallback, is loaded at this weight only
    fontWeight: 600,
    fontSize: 72,
    lineHeight: 1.1,
    // the full title is in og:title; the card only has to be recognisable
    lineClamp: 2,
};

export const subtitleStyle: CSSProperties = {
    color: SOCIAL_COLORS.text2,
    fontSize: 30,
};

export const factsStyle: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 12,
};

export const factStyle: CSSProperties = {
    display: "flex",
    padding: "12px 26px",
    borderRadius: 999,
    backgroundColor: SOCIAL_COLORS.surface2,
    color: SOCIAL_COLORS.text,
    fontSize: 28,
    fontWeight: 600,
};
