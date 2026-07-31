import { act, renderHook } from "@testing-library/react";

import { useDebouncedFieldSync } from "hooks/useDebouncedFieldSync";

const DELAY_MS = 300;

describe("useDebouncedFieldSync", () => {
    it("should update the local value immediately, before the debounce settles", () => {
        jest.useFakeTimers();

        try {
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
        } finally {
            jest.useRealTimers();
        }
    });

    it("should commit once the debounce settles", () => {
        jest.useFakeTimers();

        try {
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
        } finally {
            jest.useRealTimers();
        }
    });

    it("should resync the local value when the external value changes before the debounce settles", () => {
        jest.useFakeTimers();

        try {
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
        } finally {
            jest.useRealTimers();
        }
    });

    // documents a known limitation, not a bug to fix here: a reset that leaves `value` at the
    // same string it already was (e.g. clearing a field that was already blank) produces no prop
    // change for this hook to resync from, so a pending debounce still commits. A caller whose
    // reset can hit this needs to remount via a `key` bumped by that reset (see RecipeFilterPanel's
    // searchResetKey/popoverResetKey), the same way SearchField's callers already do
    it("should still commit a pending edit if an external reset leaves the value unchanged", () => {
        jest.useFakeTimers();

        try {
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
        } finally {
            jest.useRealTimers();
        }
    });
});
