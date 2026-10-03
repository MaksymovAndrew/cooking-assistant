const MAX_LENGTH = 160;
const ELLIPSIS = "\u2026";

export const toMetaDescription = (text: string, fallback: string): string => {
    const collapsed = text.replace(/\s+/g, " ").trim();

    if (!collapsed) {
        return fallback;
    }

    if (collapsed.length <= MAX_LENGTH) {
        return collapsed;
    }

    // the ellipsis has to fit inside the budget, not be appended past it
    const cut = collapsed.slice(0, MAX_LENGTH - ELLIPSIS.length);
    const lastSpace = cut.lastIndexOf(" ");
    const trimmed = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;

    return `${trimmed.trimEnd()}${ELLIPSIS}`;
};
