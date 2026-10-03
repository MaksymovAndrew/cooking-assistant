import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "components/ui/Button";

const LABEL = "Save recipe";

describe("Button", () => {
    it("should call onClick when clicked", async () => {
        const onClick = jest.fn();

        render(<Button onClick={onClick}>{LABEL}</Button>);

        await userEvent.click(screen.getByRole("button", { name: LABEL }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should show the loading label and disable the button while loading", () => {
        render(<Button loading>{LABEL}</Button>);

        const button = screen.getByRole("button", { name: "Saving…" });

        expect(button).toBeDisabled();
        expect(button).toHaveAttribute("aria-busy", "true");
    });

    it("should stay disabled when the disabled prop is set", () => {
        render(<Button disabled>{LABEL}</Button>);

        expect(screen.getByRole("button", { name: LABEL })).toBeDisabled();
    });

    it("should default to a button type so it never submits a form by accident", () => {
        render(<Button>{LABEL}</Button>);

        expect(screen.getByRole("button", { name: LABEL })).toHaveAttribute(
            "type",
            "button",
        );
    });
});
