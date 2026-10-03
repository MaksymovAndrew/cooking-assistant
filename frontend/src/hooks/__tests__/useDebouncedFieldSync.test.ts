import { act, renderHook } from "@testing-library/react";

import { useDebouncedFieldSync } from "hooks/useDebouncedFieldSync";

const DELAY_MS = 300;

describe("useDebouncedFieldSync", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should update the local value immediately, before the debounce settles", () => {
        const onCommit = jest.fn();
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedFieldSync(value, onCommit, DELAY_MS),
            { initialProps: { value: "" } },
        );

        act(() => {
            result.current[1]("5");
        });
        rerender({ value: "" });

        expect(result.current[0]).toBe("5");
        expect(onCommit).not.toHaveBeenCalled();
    });

    it("should resync the local value when the external value changes before the debounce settles", () => {
        const onCommit = jest.fn();
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedFieldSync(value, onCommit, DELAY_MS),
            { initialProps: { value: "" } },
        );

        act(() => {
            result.current[1]("5");
        });
        // an external reset commits a different value while the debounce is still pending
        rerender({ value: "10" });

        expect(result.current[0]).toBe("10");

        act(() => {
            jest.advanceTimersByTime(DELAY_MS);
        });

        // the stale "5" must never fire - only a real edit after the resync should commit again
        expect(onCommit).not.toHaveBeenCalled();
    });

    // a known limitation, not a bug: callers remount the field via a key their reset bumps
    it("should still commit a pending edit if an external reset leaves the value unchanged", () => {
        const onCommit = jest.fn();
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedFieldSync(value, onCommit, DELAY_MS),
            { initialProps: { value: "" } },
        );

        act(() => {
            result.current[1]("5");
        });
        rerender({ value: "" });

        act(() => {
            jest.advanceTimersByTime(DELAY_MS);
        });

        expect(onCommit).toHaveBeenCalledWith("5");
    });
});
