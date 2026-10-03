import { useEffect, useState } from "react";

// the server has no window at all, and jsdom has no matchMedia
const getMediaQueryList = (query: string): MediaQueryList | null =>
    typeof window === "undefined" || typeof window.matchMedia !== "function"
        ? null
        : window.matchMedia(query);

export const useMediaQuery = (query: string): boolean => {
    // false at first, as on the server, or a phone would hydrate desktop markup; the effect corrects it
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mql = getMediaQueryList(query);

        if (!mql) {
            return undefined;
        }

        const handleChange = () => {
            setMatches(mql.matches);
        };

        handleChange();
        mql.addEventListener("change", handleChange);

        return () => {
            mql.removeEventListener("change", handleChange);
        };
    }, [query]);

    return matches;
};
