import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ResetPasswordForm } from "components/forms/auth/ResetPasswordForm";

describe("ResetPasswordForm", () => {
    it("should render both password fields with their values", () => {
        render(
            <ResetPasswordForm
                newPassword="secret1"
                confirmPassword="secret2"
                onNewPasswordChange={jest.fn()}
                onConfirmPasswordChange={jest.fn()}
                onSubmit={jest.fn()}
                submitLabel="Reset password"
            />,
        );

        expect(screen.getByLabelText("New password")).toHaveValue("secret1");
        expect(screen.getByLabelText("Confirm password")).toHaveValue(
            "secret2",
        );
    });

    it("should call onNewPasswordChange with the new value", async () => {
        const onNewPasswordChange = jest.fn();

        render(
            <ResetPasswordForm
                newPassword=""
                confirmPassword=""
                onNewPasswordChange={onNewPasswordChange}
                onConfirmPasswordChange={jest.fn()}
                onSubmit={jest.fn()}
                submitLabel="Reset password"
            />,
        );

        await userEvent.type(screen.getByLabelText("New password"), "a");

        expect(onNewPasswordChange).toHaveBeenCalledWith("a");
    });

    it("should call onConfirmPasswordChange with the new value", async () => {
        const onConfirmPasswordChange = jest.fn();

        render(
            <ResetPasswordForm
                newPassword=""
                confirmPassword=""
                onNewPasswordChange={jest.fn()}
                onConfirmPasswordChange={onConfirmPasswordChange}
                onSubmit={jest.fn()}
                submitLabel="Reset password"
            />,
        );

        await userEvent.type(screen.getByLabelText("Confirm password"), "a");

        expect(onConfirmPasswordChange).toHaveBeenCalledWith("a");
    });

    it("should call onSubmit when the form is submitted", async () => {
        const onSubmit = jest.fn();

        render(
            <ResetPasswordForm
                newPassword="secret1"
                confirmPassword="secret1"
                onNewPasswordChange={jest.fn()}
                onConfirmPasswordChange={jest.fn()}
                onSubmit={onSubmit}
                submitLabel="Reset password"
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Reset password" }),
        );

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("should render the submit error when provided", () => {
        render(
            <ResetPasswordForm
                newPassword="secret1"
                confirmPassword="secret2"
                onNewPasswordChange={jest.fn()}
                onConfirmPasswordChange={jest.fn()}
                onSubmit={jest.fn()}
                submitLabel="Reset password"
                submitError="Passwords do not match."
            />,
        );

        expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    });
});
