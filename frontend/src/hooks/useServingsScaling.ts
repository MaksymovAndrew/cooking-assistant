import { useEffect, useMemo, useState } from "react";

const LEADING_NUMBER = /^\d+/;
const MIN_SERVINGS = 1;

// only recipes whose servings text starts with a number (e.g. "4 servings") can be scaled - free-text values like "1 large pot" are shown as-is
export const useServingsScaling = (servings: string | null) => {
    const parsed = useMemo(() => {
        if (!servings) {
            return null;
        }

        const trimmed = servings.trim();
        const match = LEADING_NUMBER.exec(trimmed);

        return match
            ? { base: Number(match[0]), suffix: trimmed.slice(match[0].length) }
            : null;
    }, [servings]);

    const [current, setCurrent] = useState(parsed?.base ?? MIN_SERVINGS);

    // servings resolve after the recipe query loads, so the useState initializer above only sees the real base once this effect runs
    useEffect(() => {
        if (parsed) {
            setCurrent(parsed.base);
        }
    }, [parsed]);

    if (!parsed) {
        return {
            canScale: false,
            current: null,
            displayValue: servings ?? "",
            scaleFactor: 1,
            increment: () => undefined,
            decrement: () => undefined,
        };
    }

    return {
        canScale: true,
        current,
        displayValue: `${current}${parsed.suffix}`,
        scaleFactor: current / parsed.base,
        increment: () => {
            setCurrent((prev) => prev + 1);
        },
        decrement: () => {
            setCurrent((prev) => Math.max(MIN_SERVINGS, prev - 1));
        },
    };
};
