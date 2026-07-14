import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import React from "react";
import { Provider } from "react-redux";
import type * as ReactRouterDom from "react-router-dom";

import { ERROR_CODES } from "constants/errorCodes";

import { API_ROUTES } from "api/endpoints";

import { useRegisterForm } from "hooks/useRegisterForm";

import { mockedPost } from "test/apiClientMock";
import { mockNavigate } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("api/client");

const EMAIL = "tester@example.com";

interface FormResult {
    current: ReturnType<typeof useRegisterForm>;
}

const wrapper = ({ children }: { children: ReactNode }) =>
    React.createElement(Provider, { store: makeTestStore(), children });

const renderRegisterForm = () =>
    renderHook(() => useRegisterForm(), { wrapper });

const setField = (
    result: FormResult,
    field: "name" | "surname" | "login" | "email" | "password",
    value: string,
) => {
    act(() => {
        result.current.setField(field, value);
    });
};

const fillValid = (result: FormResult) => {
    setField(result, "name", "Test");
    setField(result, "surname", "User");
    setField(result, "login", "tester");
    setField(result, "email", EMAIL);
    setField(result, "password", "secret1!");
};

const submit = (result: FormResult) =>
    act(async () => {
        await result.current.handleSubmit();
    });

describe("useRegisterForm", () => {
    it("should register the user and navigate to the dashboard when all fields are valid", async () => {
        mockedPost.mockResolvedValue({ data: null });

        const { result } = renderRegisterForm();

        fillValid(result);
        await submit(result);

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.auth.register, {
            name: "Test",
            surname: "User",
            login: "tester",
            email: EMAIL,
            password: "secret1!",
        });
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should trim leading and trailing whitespace from name, surname, login and email before submitting", async () => {
        mockedPost.mockResolvedValue({ data: null });

        const { result } = renderRegisterForm();

        setField(result, "name", "Test ");
        setField(result, "surname", " User");
        setField(result, "login", " tester ");
        setField(result, "email", " tester@example.com ");
        setField(result, "password", "secret1!");
        await submit(result);

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.auth.register, {
            name: "Test",
            surname: "User",
            login: "tester",
            email: EMAIL,
            password: "secret1!",
        });
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should not submit and should set a field error when the name is invalid", async () => {
        const { result } = renderRegisterForm();

        setField(result, "name", "test");
        setField(result, "surname", "User");
        setField(result, "login", "tester");
        setField(result, "email", EMAIL);
        setField(result, "password", "secret1!");
        await submit(result);

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.errors.name).toBe(
            "Name must start with a capital letter and contain only letters, at least 2 characters.",
        );
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should not submit and should set a field error when the surname is invalid", async () => {
        const { result } = renderRegisterForm();

        setField(result, "name", "Test");
        setField(result, "surname", "user");
        setField(result, "login", "tester");
        setField(result, "email", EMAIL);
        setField(result, "password", "secret1!");
        await submit(result);

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.errors.surname).toBe(
            "Surname must start with a capital letter and contain only letters, at least 2 characters.",
        );
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should not submit and should set a field error when the login is invalid", async () => {
        const { result } = renderRegisterForm();

        setField(result, "name", "Test");
        setField(result, "surname", "User");
        setField(result, "login", "a");
        setField(result, "email", EMAIL);
        setField(result, "password", "secret1!");
        await submit(result);

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.errors.login).toBeDefined();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should not submit and should set a field error when the email is invalid", async () => {
        const { result } = renderRegisterForm();

        setField(result, "name", "Test");
        setField(result, "surname", "User");
        setField(result, "login", "tester");
        setField(result, "email", "not-an-email");
        setField(result, "password", "secret1!");
        await submit(result);

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.errors.email).toBe(
            "Please enter a valid email address.",
        );
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should reject a short password without submitting", async () => {
        const { result } = renderRegisterForm();

        setField(result, "name", "Test");
        setField(result, "surname", "User");
        setField(result, "login", "tester");
        setField(result, "email", EMAIL);
        setField(result, "password", "short");
        await submit(result);

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.errors.password).toBe(
            "Password must be at least 8 characters and include a letter, a number, and a special character.",
        );
    });

    it("should set a required-fields error when a field is empty", async () => {
        const { result } = renderRegisterForm();

        await submit(result);

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.error).toBe("Please fill in all fields.");
    });

    it("should set a generic error when registration fails", async () => {
        mockedPost.mockRejectedValue(
            Object.assign(new Error(), {
                isAxiosError: true,
                response: { status: 409, data: { error: "exists" } },
            }),
        );

        const { result } = renderRegisterForm();

        fillValid(result);
        await submit(result);

        expect(result.current.error).toBe("This user already exists.");
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should set an email-already-taken error when the email code is returned", async () => {
        mockedPost.mockRejectedValue(
            Object.assign(new Error(), {
                isAxiosError: true,
                response: {
                    status: 409,
                    data: {
                        error: "Email already taken",
                        code: ERROR_CODES.EMAIL_ALREADY_TAKEN,
                    },
                },
            }),
        );

        const { result } = renderRegisterForm();

        fillValid(result);
        await submit(result);

        expect(result.current.error).toBe(
            "An account with this email already exists.",
        );
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should set a registration-failed error for an unrecognized status", async () => {
        mockedPost.mockRejectedValue(
            Object.assign(new Error(), {
                isAxiosError: true,
                response: {
                    status: 400,
                    data: { error: "Name cannot be empty" },
                },
            }),
        );

        const { result } = renderRegisterForm();

        fillValid(result);
        await submit(result);

        expect(result.current.error).toBe(
            "Registration failed. Please check your details and try again.",
        );
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should set a rate-limit error when registration is throttled", async () => {
        mockedPost.mockRejectedValue(
            Object.assign(new Error(), {
                isAxiosError: true,
                response: {
                    status: 429,
                    data: { error: "Too many requests" },
                    headers: { "retry-after": "30" },
                },
            }),
        );

        const { result } = renderRegisterForm();

        fillValid(result);
        await submit(result);

        expect(result.current.error).toBe(
            "Too many registration attempts. Please wait 30 seconds.",
        );
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
