export interface IconProps {
    size?: number;
    className?: string;
    // lucide parity only: each glyph's own svg already sets aria-hidden
    "aria-hidden"?: boolean | "true" | "false";
}
