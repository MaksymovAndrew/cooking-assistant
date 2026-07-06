export interface IconProps {
    size?: number;
    className?: string;
    // accepted for prop-shape parity with lucide-react icons; aria-hidden is
    // already baked into each hand-authored glyph's own svg markup
    "aria-hidden"?: boolean | "true" | "false";
}
