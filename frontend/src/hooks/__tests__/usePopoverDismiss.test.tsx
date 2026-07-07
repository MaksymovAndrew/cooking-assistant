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
});
