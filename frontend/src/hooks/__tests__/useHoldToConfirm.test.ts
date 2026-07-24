import { act, renderHook } from "@testing-library/react";

import { useHoldToConfirm } from "hooks/useHoldToConfirm";

const DURATION_MS = 500;

describe("useHoldToConfirm", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should call onComplete after a full hold", () => {
        const onComplete = jest.fn();
        const { result } = renderHook(() =>
            useHoldToConfirm(DURATION_MS, onComplete),
        );

        act(() => {
            result.current.start();
        });
        expect(result.current.isHolding).toBe(true);

        act(() => {
            jest.advanceTimersByTime(DURATION_MS);
        });

        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(result.current.isHolding).toBe(false);
    });

    it("should not call onComplete when cancelled before the duration elapses", () => {
        const onComplete = jest.fn();
        const { result } = renderHook(() =>
            useHoldToConfirm(DURATION_MS, onComplete),
        );

        act(() => {
            result.current.start();
        });
        act(() => {
            jest.advanceTimersByTime(200);
        });
        act(() => {
            result.current.cancel();
        });
        act(() => {
            jest.advanceTimersByTime(DURATION_MS);
        });

        expect(onComplete).not.toHaveBeenCalled();
        expect(result.current.isHolding).toBe(false);
    });

    it("should restart cleanly on a second hold after an early cancel", () => {
        const onComplete = jest.fn();
        const { result } = renderHook(() =>
            useHoldToConfirm(DURATION_MS, onComplete),
        );

        act(() => {
            result.current.start();
        });
        act(() => {
            result.current.cancel();
        });
        act(() => {
            result.current.start();
        });
        act(() => {
            jest.advanceTimersByTime(DURATION_MS);
        });

        expect(onComplete).toHaveBeenCalledTimes(1);
    });
});
