import { useEffect, useState } from "react";

// jsdom has no matchMedia - falls back to false there, same guard pattern as themeSlice's prefersLightScheme()
const getMatches = (query: string): boolean =>
    typeof window.matchMedia === "function" && window.matchMedia(query).matches;

export const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState(() => getMatches(query));

    useEffect(() => {
        if (typeof window.matchMedia !== "function") {
            return undefined;
        }

        const mql = window.matchMedia(query);
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
