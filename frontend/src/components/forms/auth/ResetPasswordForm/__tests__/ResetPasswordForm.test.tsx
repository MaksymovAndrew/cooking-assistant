import { render, screen } from "@testing-library/react";

import { ResetPasswordForm } from "components/forms/auth/ResetPasswordForm";

describe("ResetPasswordForm", () => {
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
