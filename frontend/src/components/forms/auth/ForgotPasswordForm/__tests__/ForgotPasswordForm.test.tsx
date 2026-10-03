import { render, screen } from "@testing-library/react";

import { ForgotPasswordForm } from "components/forms/auth/ForgotPasswordForm";

describe("ForgotPasswordForm", () => {
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
