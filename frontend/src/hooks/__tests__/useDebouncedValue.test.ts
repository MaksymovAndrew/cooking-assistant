import { act, renderHook } from "@testing-library/react";

import { useDebouncedValue } from "hooks/useDebouncedValue";

const DELAY_MS = 300;

describe("useDebouncedValue", () => {
    it("should return the initial value immediately", () => {
        const { result } = renderHook(() =>
            useDebouncedValue("first", DELAY_MS),
        );

        expect(result.current).toBe("first");
    });

    it("should not update until delayMs has passed", () => {
        jest.useFakeTimers();

        try {
            const { result, rerender } = renderHook(
                ({ value }) => useDebouncedValue(value, DELAY_MS),
                { initialProps: { value: "first" } },
            );

            rerender({ value: "second" });
            expect(result.current).toBe("first");

            act(() => {
                jest.advanceTimersByTime(DELAY_MS - 1);
            });
            expect(result.current).toBe("first");

            act(() => {
                jest.advanceTimersByTime(1);
            });
            expect(result.current).toBe("second");
        } finally {
            jest.useRealTimers();
        }
    });

    it("should restart the delay on every change, only settling on the last value", () => {
        jest.useFakeTimers();

        try {
            const { result, rerender } = renderHook(
                ({ value }) => useDebouncedValue(value, DELAY_MS),
                { initialProps: { value: "first" } },
            );

            rerender({ value: "second" });
            act(() => {
                jest.advanceTimersByTime(DELAY_MS - 1);
            });
            rerender({ value: "third" });
            act(() => {
                jest.advanceTimersByTime(DELAY_MS - 1);
            });

            expect(result.current).toBe("first");

            act(() => {
                jest.advanceTimersByTime(1);
            });
            expect(result.current).toBe("third");
        } finally {
            jest.useRealTimers();
        }
    });
});
