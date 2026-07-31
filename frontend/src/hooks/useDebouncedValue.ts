import { useEffect, useState } from "react";

// first debounce primitive in the project - settles delayMs after the last change, clearing the pending timer on every re-run so a rapid burst of updates only ever fires once
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delayMs);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delayMs]);

    return debouncedValue;
};
