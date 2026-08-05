import type { AxiosResponse } from "axios";
import { AxiosError, AxiosHeaders } from "axios";

import { ROUTES } from "constants/routes";

import { handleAuthError } from "api/client";
import { API_ROUTES } from "api/endpoints";
import { redirectToLogin } from "api/redirect";

jest.mock("api/redirect");

const makeResponse = (status: number): AxiosResponse => ({
    status,
    statusText: "",
    data: null,
    headers: {},
    config: { headers: new AxiosHeaders() },
});

const makeAuthError = (
    status?: number,
    url: string | null = null,
): AxiosError => {
    const error = new AxiosError("request failed");

    if (typeof status === "number") {
        error.response = makeResponse(status);
    }
    if (url !== null) {
        error.config = { url, headers: new AxiosHeaders() };
    }

    return error;
};

describe("handleAuthError", () => {
    beforeEach(() => {
        window.history.pushState({}, "", "/protected");
    });

    it("should redirect to login on a 401 from a protected page", async () => {
        const error = makeAuthError(401);

        await expect(handleAuthError(error)).rejects.toBe(error);

        expect(jest.mocked(redirectToLogin)).toHaveBeenCalled();
    });

    it("should redirect to login on a 403 from a protected page", async () => {
        const error = makeAuthError(403);

        await expect(handleAuthError(error)).rejects.toBe(error);

        expect(jest.mocked(redirectToLogin)).toHaveBeenCalled();
    });

    it("should not redirect on a non-auth error", async () => {
        const error = makeAuthError(500);

        await expect(handleAuthError(error)).rejects.toBe(error);

        expect(jest.mocked(redirectToLogin)).not.toHaveBeenCalled();
    });

    it("should not redirect when already on the login page", async () => {
        window.history.pushState({}, "", ROUTES.login);
        const error = makeAuthError(401);

        await expect(handleAuthError(error)).rejects.toBe(error);

        expect(jest.mocked(redirectToLogin)).not.toHaveBeenCalled();
    });

    it("should not redirect when on the registration page", async () => {
        window.history.pushState({}, "", ROUTES.registration);
        const error = makeAuthError(401);

        await expect(handleAuthError(error)).rejects.toBe(error);

        expect(jest.mocked(redirectToLogin)).not.toHaveBeenCalled();
    });

    it("should not redirect on a 401 from the /me endpoint", async () => {
        const error = makeAuthError(401, API_ROUTES.auth.me);

        await expect(handleAuthError(error)).rejects.toBe(error);

        expect(jest.mocked(redirectToLogin)).not.toHaveBeenCalled();
    });

    it("should not redirect on a 401 from the change-password endpoint", async () => {
        const error = makeAuthError(401, API_ROUTES.auth.changePassword);

        await expect(handleAuthError(error)).rejects.toBe(error);

        expect(jest.mocked(redirectToLogin)).not.toHaveBeenCalled();
    });

    it("should not redirect on a 401 from the all-recipes page (public for guests)", async () => {
        window.history.pushState({}, "", ROUTES.allRecipes);
        const error = makeAuthError(401);

        await expect(handleAuthError(error)).rejects.toBe(error);

        expect(jest.mocked(redirectToLogin)).not.toHaveBeenCalled();
    });

    it("should not redirect on a 401 from a recipe detail page - a dynamic :id route (public for guests)", async () => {
        window.history.pushState({}, "", "/recipe/236");
        const error = makeAuthError(401);

        await expect(handleAuthError(error)).rejects.toBe(error);

        expect(jest.mocked(redirectToLogin)).not.toHaveBeenCalled();
    });

    it("should still redirect on a 401 from a still-private route that merely starts with a public one's prefix", async () => {
        window.history.pushState({}, "", "/recipe/236/something-else");
        const error = makeAuthError(401);

        await expect(handleAuthError(error)).rejects.toBe(error);

        expect(jest.mocked(redirectToLogin)).toHaveBeenCalled();
    });
});
