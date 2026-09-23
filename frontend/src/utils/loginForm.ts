import type { RefObject } from "react";

import type { LoginRequest } from "types/auth";

import { isValidEmail } from "utils/authValidation";

export type LoginMode = "username" | "email";

// the auth-namespace key of what stops the form from being sent, or null when it can go
export const loginInputErrorKey = (
    values: LoginRequest,
    mode: LoginMode,
): string | null => {
    if (!values.login || !values.password) {
        return "errors.allFieldsRequired";
    }

    return mode === "email" && !isValidEmail(values.login)
        ? "errors.email"
        : null;
};

// runs `update` only if `login` is still the identifier on screen, guarding against a stale
// response overwriting a since-changed account's state
export const applyIfCurrent = (
    currentLoginRef: RefObject<string>,
    login: string,
    update: () => void,
): void => {
    if (currentLoginRef.current === login) {
        update();
    }
};
