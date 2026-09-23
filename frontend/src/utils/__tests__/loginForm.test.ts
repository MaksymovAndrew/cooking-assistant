import { applyIfCurrent, loginInputErrorKey } from "utils/loginForm";

describe("loginInputErrorKey", () => {
    it("should ask for both fields when one is empty", () => {
        expect(
            loginInputErrorKey({ login: "ada", password: "" }, "username"),
        ).toBe("errors.allFieldsRequired");
    });

    it("should reject a malformed email in email mode", () => {
        expect(
            loginInputErrorKey({ login: "ada", password: "secret" }, "email"),
        ).toBe("errors.email");
    });

    it("should let a username through without an email check", () => {
        expect(
            loginInputErrorKey(
                { login: "ada", password: "secret" },
                "username",
            ),
        ).toBeNull();
    });
});

describe("applyIfCurrent", () => {
    it("should run the update for the identifier still on screen", () => {
        const update = jest.fn();

        applyIfCurrent({ current: "ada" }, "ada", update);

        expect(update).toHaveBeenCalledTimes(1);
    });

    it("should skip the update once the identifier has changed", () => {
        const update = jest.fn();

        applyIfCurrent({ current: "bob" }, "ada", update);

        expect(update).not.toHaveBeenCalled();
    });
});
