import { render, screen } from "@testing-library/react";

import { RegisterForm } from "components/forms/auth/RegisterForm";

const VALUES = {
    name: "Test",
    surname: "User",
    login: "tester",
    email: "tester@example.com",
    password: "secret1",
};

describe("RegisterForm", () => {
    it("should render a field error", () => {
        render(
            <RegisterForm
                values={VALUES}
                errors={{ password: "Password must be at least 6 characters." }}
                onFieldChange={jest.fn()}
                onSubmit={jest.fn()}
                submitLabel="Register"
            />,
        );

        expect(
            screen.getByText("Password must be at least 6 characters."),
        ).toBeInTheDocument();
    });
});
