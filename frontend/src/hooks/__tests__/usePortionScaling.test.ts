import { act, renderHook } from "@testing-library/react";

import { usePortionScaling } from "hooks/usePortionScaling";

describe("usePortionScaling", () => {
    it("should start at 1 portion", () => {
        const { result } = renderHook(() => usePortionScaling());

        expect(result.current.count).toBe(1);
    });

    it("should increment the portion count", () => {
        const { result } = renderHook(() => usePortionScaling());

        act(() => {
            result.current.increment();
        });

        expect(result.current.count).toBe(2);
    });

    it("should decrement the portion count down to a minimum of 1", () => {
        const { result } = renderHook(() => usePortionScaling());

        act(() => {
            result.current.increment();
        });
        act(() => {
            result.current.decrement();
        });
        act(() => {
            result.current.decrement();
        });

        expect(result.current.count).toBe(1);
    });
});
