import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RegisterForm } from "components/forms/auth/RegisterForm";

const VALUES = {
    name: "Test",
    surname: "User",
    login: "tester",
    password: "secret1",
};

const EMPTY_VALUES = { name: "", surname: "", login: "", password: "" };

describe("RegisterForm", () => {
    it("should render all fields with their values", () => {
        render(
            <RegisterForm
                values={VALUES}
                errors={{}}
                onFieldChange={jest.fn()}
                onSubmit={jest.fn()}
                submitLabel="Register"
            />,
        );

        expect(screen.getByLabelText("Name:")).toHaveValue("Test");
        expect(screen.getByLabelText("Surname:")).toHaveValue("User");
        expect(screen.getByLabelText("Username")).toHaveValue("tester");
        expect(screen.getByLabelText("Password")).toHaveValue("secret1");
    });

    it("should call onFieldChange with the field name and value", async () => {
        const onFieldChange = jest.fn();

        render(
            <RegisterForm
                values={EMPTY_VALUES}
                errors={{}}
                onFieldChange={onFieldChange}
                onSubmit={jest.fn()}
                submitLabel="Register"
            />,
        );

        await userEvent.type(screen.getByLabelText("Name:"), "A");

        expect(onFieldChange).toHaveBeenCalledWith("name", "A");
    });

    it("should call onSubmit when the form is submitted", async () => {
        const onSubmit = jest.fn();

        render(
            <RegisterForm
                values={VALUES}
                errors={{}}
                onFieldChange={jest.fn()}
                onSubmit={onSubmit}
                submitLabel="Register"
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Register" }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

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
