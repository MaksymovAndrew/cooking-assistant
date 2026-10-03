import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";

import { usePopoverDismiss } from "hooks/usePopoverDismiss";

const Probe = ({
    onDismiss,
    isOpen,
}: {
    onDismiss: () => void;
    isOpen: boolean;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    usePopoverDismiss(ref, isOpen, onDismiss);

    return (
        <div>
            <div ref={ref}>
                <button>inside</button>
            </div>
            <button>outside</button>
        </div>
    );
};

const ProbeWithTrigger = () => {
    const ref = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    usePopoverDismiss(ref, true, jest.fn(), triggerRef);

    return (
        <div>
            <button ref={triggerRef}>trigger</button>
            <div ref={ref}>
                <button>inside</button>
            </div>
            <button>outside</button>
            <p>plain text</p>
        </div>
    );
};

describe("usePopoverDismiss", () => {
    it("should call onDismiss when a click lands outside the element", async () => {
        const onDismiss = jest.fn();

        render(<Probe onDismiss={onDismiss} isOpen />);

        await userEvent.click(screen.getByRole("button", { name: "outside" }));

        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("should call onDismiss when Escape is pressed", async () => {
        const onDismiss = jest.fn();

        render(<Probe onDismiss={onDismiss} isOpen />);

        await userEvent.keyboard("{Escape}");

        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("should not listen when closed", async () => {
        const onDismiss = jest.fn();

        render(<Probe onDismiss={onDismiss} isOpen={false} />);

        await userEvent.click(screen.getByRole("button", { name: "outside" }));
        await userEvent.keyboard("{Escape}");

        expect(onDismiss).not.toHaveBeenCalled();
    });

    it("should return focus to the trigger on Escape", async () => {
        render(<ProbeWithTrigger />);

        screen.getByRole("button", { name: "inside" }).focus();
        await userEvent.keyboard("{Escape}");

        expect(screen.getByRole("button", { name: "trigger" })).toHaveFocus();
    });

    it("should return focus to the trigger when an outside click takes it from the popover", async () => {
        render(<ProbeWithTrigger />);

        screen.getByRole("button", { name: "inside" }).focus();
        await userEvent.click(screen.getByText("plain text"));

        expect(screen.getByRole("button", { name: "trigger" })).toHaveFocus();
    });

    it("should let an outside click on another control keep its focus", async () => {
        render(<ProbeWithTrigger />);

        screen.getByRole("button", { name: "inside" }).focus();
        await userEvent.click(screen.getByRole("button", { name: "outside" }));

        expect(screen.getByRole("button", { name: "outside" })).toHaveFocus();
    });
});
