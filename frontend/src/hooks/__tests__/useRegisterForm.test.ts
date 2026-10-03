import { act } from "@testing-library/react";

import { ERROR_CODES } from "constants/errorCodes";

import { API_ROUTES } from "api/endpoints";

import { useRegisterForm } from "hooks/useRegisterForm";

import { mockedPost } from "test/apiClientMock";
import { mockNavigate } from "test/router";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");

const EMAIL = "tester@example.com";

interface FormResult {
    current: ReturnType<typeof useRegisterForm>;
}

const renderRegisterForm = () => renderHookWithStore(() => useRegisterForm());

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
            "Name must start with a capital letter and use only letters (a hyphen or an apostrophe is fine), at least 2 characters.",
        );
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should set a required-fields error when a field is empty", async () => {
        const { result } = renderRegisterForm();

        await submit(result);

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.error).toBe("Please fill in all fields.");
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
