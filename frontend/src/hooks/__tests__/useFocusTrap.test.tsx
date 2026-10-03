import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";

import { useFocusTrap } from "hooks/useFocusTrap";

const Probe = () => {
    const ref = useRef<HTMLDivElement>(null);

    useFocusTrap(ref);

    return (
        <div ref={ref}>
            <button>First</button>
            <button>Last</button>
        </div>
    );
};

describe("useFocusTrap", () => {
    it("should wrap Tab from the last focusable element back to the first", async () => {
        render(<Probe />);

        const first = screen.getByRole("button", { name: "First" });
        const last = screen.getByRole("button", { name: "Last" });

        last.focus();
        await userEvent.tab();

        expect(first).toHaveFocus();
    });

    it("should wrap Shift+Tab from the first focusable element back to the last", async () => {
        render(<Probe />);

        const first = screen.getByRole("button", { name: "First" });
        const last = screen.getByRole("button", { name: "Last" });

        first.focus();
        await userEvent.tab({ shift: true });

        expect(last).toHaveFocus();
    });

    it("should move Shift+Tab from the focused container to the last focusable element", async () => {
        const Container = () => {
            const ref = useRef<HTMLDivElement>(null);

            useFocusTrap(ref);

            return (
                <div ref={ref} tabIndex={-1} data-testid="container">
                    <button>First</button>
                    <button>Last</button>
                </div>
            );
        };

        render(<Container />);

        screen.getByTestId("container").focus();
        await userEvent.tab({ shift: true });

        expect(screen.getByRole("button", { name: "Last" })).toHaveFocus();
    });

    it("should move Tab from the focused container to the first focusable element", async () => {
        const Container = () => {
            const ref = useRef<HTMLDivElement>(null);

            useFocusTrap(ref);

            return (
                <div>
                    <button>Before</button>
                    <div ref={ref} tabIndex={-1} data-testid="container">
                        <button>First</button>
                    </div>
                </div>
            );
        };

        render(<Container />);

        screen.getByTestId("container").focus();
        await userEvent.tab();

        expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
    });

    it("should not interfere with tab order when the container has no focusable elements", async () => {
        const Empty = () => {
            const ref = useRef<HTMLDivElement>(null);

            useFocusTrap(ref);

            return (
                <div>
                    <div ref={ref} />
                    <button>Elsewhere</button>
                </div>
            );
        };

        render(<Empty />);

        await userEvent.tab();

        expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();
    });
});
