import { useState } from "react";

const MIN_PORTIONS = 1;

// a recipe's ingredient quantities and calories are always authored per single portion, so
// scaling is just a multiplier - unlike the old free-text "servings" field, there is no base
// value to parse or fall back on
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
