import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PasswordInput } from "components/ui/PasswordInput";

describe("PasswordInput", () => {
    it("should render as a password field by default", () => {
        render(
            <PasswordInput
                aria-label="Password"
                value="secret"
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByLabelText("Password")).toHaveAttribute(
            "type",
            "password",
        );
    });

    it("should toggle to a visible text field and back", async () => {
        render(
            <PasswordInput
                aria-label="Password"
                value="secret"
                onChange={jest.fn()}
            />,
        );

        const input = screen.getByLabelText("Password");

        await userEvent.click(
            screen.getByRole("button", { name: "Show password" }),
        );

        expect(input).toHaveAttribute("type", "text");

        await userEvent.click(
            screen.getByRole("button", { name: "Hide password" }),
        );

        expect(input).toHaveAttribute("type", "password");
    });

    it("should call onChange with the typed character", async () => {
        const onChange = jest.fn();

        render(
            <PasswordInput
                aria-label="Password"
                value=""
                onChange={onChange}
            />,
        );

        await userEvent.type(screen.getByLabelText("Password"), "a");

        expect(onChange).toHaveBeenCalled();
    });
});
