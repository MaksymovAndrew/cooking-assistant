import { useState } from "react";

const MIN_PORTIONS = 1;

// quantities and calories are authored per portion, so scaling is a plain multiplier
export const usePortionScaling = () => {
    const [count, setCount] = useState(MIN_PORTIONS);

    return {
        count,
        increment: () => {
            setCount((prev) => prev + 1);
        },
        decrement: () => {
            setCount((prev) => Math.max(MIN_PORTIONS, prev - 1));
        },
    };
};
