import { act, renderHook } from "@testing-library/react";

import { useServingsScaling } from "hooks/useServingsScaling";

const FOUR_SERVINGS = "4 servings";
const EIGHT_SERVINGS = "8 servings";

describe("useServingsScaling", () => {
    it("should not allow scaling when servings has no leading number", () => {
        const { result } = renderHook(() => useServingsScaling("full pot"));

        expect(result.current.canScale).toBe(false);
        expect(result.current.displayValue).toBe("full pot");
        expect(result.current.scaleFactor).toBe(1);
    });

    it("should not allow scaling when servings is null", () => {
        const { result } = renderHook(() => useServingsScaling(null));

        expect(result.current.canScale).toBe(false);
        expect(result.current.displayValue).toBe("");
    });

    it("should parse a leading number and keep the trailing text", () => {
        const { result } = renderHook(() => useServingsScaling(FOUR_SERVINGS));

        expect(result.current.canScale).toBe(true);
        expect(result.current.displayValue).toBe(FOUR_SERVINGS);
        expect(result.current.scaleFactor).toBe(1);
    });

    it("should increment the servings count and update the scale factor", () => {
        const { result } = renderHook(() => useServingsScaling(FOUR_SERVINGS));

        act(() => {
            result.current.increment();
        });

        expect(result.current.current).toBe(5);
        expect(result.current.displayValue).toBe("5 servings");
        expect(result.current.scaleFactor).toBe(1.25);
    });

    it("should resync the current count once servings arrives after the initial null render", () => {
        const { result, rerender } = renderHook(
            ({ servings }) => useServingsScaling(servings),
            { initialProps: { servings: null as string | null } },
        );

        expect(result.current.current).toBeNull();

        rerender({ servings: EIGHT_SERVINGS });

        expect(result.current.current).toBe(8);
        expect(result.current.displayValue).toBe(EIGHT_SERVINGS);
        expect(result.current.scaleFactor).toBe(1);
    });

    it("should decrement the servings count down to a minimum of 1", () => {
        const { result } = renderHook(() => useServingsScaling("1 serving"));

        act(() => {
            result.current.decrement();
        });

        expect(result.current.displayValue).toBe("1 serving");
        expect(result.current.scaleFactor).toBe(1);
    });
});
