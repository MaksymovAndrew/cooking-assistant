import { act, fireEvent, render, screen } from "@testing-library/react";

import { DeleteAccountButton } from "components/settings/DeleteAccountButton";

const HOLD_MS = 500;
const EARLY_RELEASE_MS = 200;

describe("DeleteAccountButton", () => {
    it("should confirm after a full hold even when pointer capture is refused", () => {
        jest.useFakeTimers();
        const onConfirm = jest.fn();

        render(<DeleteAccountButton onConfirm={onConfirm} />);

        const button = screen.getByRole("button", { name: "Delete account" });

        fireEvent.pointerDown(button, { pointerId: 1 });
        act(() => {
            jest.advanceTimersByTime(HOLD_MS);
        });
        jest.useRealTimers();

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("should not confirm when the hold is released early", () => {
        jest.useFakeTimers();
        const onConfirm = jest.fn();

        render(<DeleteAccountButton onConfirm={onConfirm} />);

        const button = screen.getByRole("button", { name: "Delete account" });

        fireEvent.pointerDown(button, { pointerId: 1 });
        act(() => {
            jest.advanceTimersByTime(EARLY_RELEASE_MS);
        });
        fireEvent.pointerUp(button, { pointerId: 1 });
        act(() => {
            jest.advanceTimersByTime(HOLD_MS);
        });
        jest.useRealTimers();

        expect(onConfirm).not.toHaveBeenCalled();
    });

    it.each(["Enter", " "])("should confirm at once on the %p key", (key) => {
        const onConfirm = jest.fn();

        render(<DeleteAccountButton onConfirm={onConfirm} />);
        fireEvent.keyDown(screen.getByRole("button"), { key });

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("should ignore other keys", () => {
        const onConfirm = jest.fn();

        render(<DeleteAccountButton onConfirm={onConfirm} />);
        fireEvent.keyDown(screen.getByRole("button"), { key: "Tab" });

        expect(onConfirm).not.toHaveBeenCalled();
    });
});
