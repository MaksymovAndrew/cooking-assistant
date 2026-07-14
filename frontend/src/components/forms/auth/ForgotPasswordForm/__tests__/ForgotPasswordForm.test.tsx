import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ForgotPasswordForm } from "components/forms/auth/ForgotPasswordForm";

describe("ForgotPasswordForm", () => {
    it("should render the email field with its value", () => {
        render(
            <ForgotPasswordForm
                email="tester@example.com"
                onEmailChange={jest.fn()}
                onSubmit={jest.fn()}
                submitLabel="Send reset link"
            />,
        );

        expect(screen.getByLabelText("Email")).toHaveValue(
            "tester@example.com",
        );
    });

    it("should call onEmailChange with the new value", async () => {
        const onEmailChange = jest.fn();

        render(
            <ForgotPasswordForm
                email=""
                onEmailChange={onEmailChange}
                onSubmit={jest.fn()}
                submitLabel="Send reset link"
            />,
        );

        await userEvent.type(screen.getByLabelText("Email"), "a");

        expect(onEmailChange).toHaveBeenCalledWith("a");
    });

    it("should call onSubmit when the form is submitted", async () => {
        const onSubmit = jest.fn();

        render(
            <ForgotPasswordForm
                email="tester@example.com"
                onEmailChange={jest.fn()}
                onSubmit={onSubmit}
                submitLabel="Send reset link"
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Send reset link" }),
        );

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("should render the submit error when provided", () => {
        render(
            <ForgotPasswordForm
                email="tester@example.com"
                onEmailChange={jest.fn()}
                onSubmit={jest.fn()}
                submitLabel="Send reset link"
                submitError="Please enter a valid email address."
            />,
        );

        expect(
            screen.getByText("Please enter a valid email address."),
        ).toBeInTheDocument();
    });
});
