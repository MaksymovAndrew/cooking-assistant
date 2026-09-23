export interface ThumbMetrics {
    widthPercent: number;
    offsetPercent: number;
}

const PERCENT_MULTIPLIER = 100;

// null once the content fits, so the scrollbar renders nothing at all
export const computeThumb = (el: HTMLElement): ThumbMetrics | null => {
    const { scrollWidth, clientWidth, scrollLeft } = el;

    if (scrollWidth <= clientWidth) {
        return null;
    }

    const widthPercent = (clientWidth / scrollWidth) * PERCENT_MULTIPLIER;
    const maxScrollLeft = scrollWidth - clientWidth;
    const offsetPercent =
        maxScrollLeft > 0
            ? (scrollLeft / maxScrollLeft) * (PERCENT_MULTIPLIER - widthPercent)
            : 0;

    return { widthPercent, offsetPercent };
};
