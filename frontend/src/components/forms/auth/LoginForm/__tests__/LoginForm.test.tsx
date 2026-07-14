import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ROUTES } from "constants/routes";

import { LoginForm } from "components/forms/auth/LoginForm";

import { renderWithRouter } from "test/router";

const VALUES = { login: "tester", password: "secret1" };

describe("LoginForm", () => {
    it("should render the username and password fields with their values", () => {
        renderWithRouter(
            <LoginForm
                values={VALUES}
                onFieldChange={jest.fn()}
                loginMode="username"
                onModeChange={jest.fn()}
                onSubmit={jest.fn()}
                submitLabel="Log In"
            />,
        );

        expect(screen.getByLabelText("Username")).toHaveValue("tester");
        expect(screen.getByLabelText("Password")).toHaveValue("secret1");
    });

    it("should call onFieldChange with the field name and value", async () => {
        const onFieldChange = jest.fn();

        renderWithRouter(
            <LoginForm
                values={{ login: "", password: "" }}
                onFieldChange={onFieldChange}
                loginMode="username"
                onModeChange={jest.fn()}
                onSubmit={jest.fn()}
                submitLabel="Log In"
            />,
        );

        await userEvent.type(screen.getByLabelText("Username"), "a");

        expect(onFieldChange).toHaveBeenCalledWith("login", "a");
    });

    it("should call onSubmit when the form is submitted", async () => {
        const onSubmit = jest.fn();

        renderWithRouter(
            <LoginForm
                values={VALUES}
                onFieldChange={jest.fn()}
                loginMode="username"
                onModeChange={jest.fn()}
                onSubmit={onSubmit}
                submitLabel="Log In"
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Log In" }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("should render the submit error when provided", () => {
        renderWithRouter(
            <LoginForm
                values={VALUES}
                onFieldChange={jest.fn()}
                loginMode="username"
                onModeChange={jest.fn()}
                onSubmit={jest.fn()}
                submitLabel="Log In"
                submitError="Incorrect username or password."
            />,
        );

        expect(
            screen.getByText("Incorrect username or password."),
        ).toBeInTheDocument();
    });

    it("should link Forgot password? to the forgot-password route", () => {
        renderWithRouter(
            <LoginForm
                values={VALUES}
                onFieldChange={jest.fn()}
                loginMode="username"
                onModeChange={jest.fn()}
                onSubmit={jest.fn()}
                submitLabel="Log In"
            />,
        );

        expect(screen.getByText("Forgot password?")).toHaveAttribute(
            "href",
            ROUTES.forgotPassword,
        );
    });

    it("should show the live lockout countdown instead of the submit error while locked", () => {
        renderWithRouter(
            <LoginForm
                values={VALUES}
                onFieldChange={jest.fn()}
                loginMode="username"
                onModeChange={jest.fn()}
                onSubmit={jest.fn()}
                submitLabel="Log In"
                submitError="Incorrect username or password."
                isLocked
                lockoutRemainingMs={65_000}
            />,
        );

        expect(
            screen.getByText("Too many attempts - account locked."),
        ).toBeInTheDocument();
        expect(screen.getByText("1:05")).toBeInTheDocument();
        expect(
            screen.queryByText("Incorrect username or password."),
        ).not.toBeInTheDocument();
    });

    it("should label the identifier field as Email when in email mode", () => {
        renderWithRouter(
            <LoginForm
                values={VALUES}
                onFieldChange={jest.fn()}
                loginMode="email"
                onModeChange={jest.fn()}
                onSubmit={jest.fn()}
                submitLabel="Log In"
            />,
        );

        expect(screen.getByLabelText("Email")).toHaveValue("tester");
    });

    it("should call onModeChange when the Email segment is selected", async () => {
        const onModeChange = jest.fn();

        renderWithRouter(
            <LoginForm
                values={VALUES}
                onFieldChange={jest.fn()}
                loginMode="username"
                onModeChange={onModeChange}
                onSubmit={jest.fn()}
                submitLabel="Log In"
            />,
        );

        await userEvent.click(screen.getByRole("radio", { name: "Email" }));

        expect(onModeChange).toHaveBeenCalledWith("email");
    });
});
