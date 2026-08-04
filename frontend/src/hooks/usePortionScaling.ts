import { useState } from "react";

const MIN_PORTIONS = 1;

// quantities/calories are authored per single portion, so scaling is just a multiplier - no base value to parse, unlike the old free-text "servings" field
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
