import { SCROLL_TO_TOP_REVEAL_OFFSET_PX } from "constants/scrollToTop";

// the button shows only past the reveal offset; a page that cannot scroll that far never shows it
export const needsScrollToTopClearance = (
    pageHeight: number,
    viewportHeight: number,
): boolean => pageHeight - viewportHeight > SCROLL_TO_TOP_REVEAL_OFFSET_PX;
