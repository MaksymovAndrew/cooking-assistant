import type {
    DeleteAccountRequest,
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest,
} from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";

import {
    mockedDelete,
    mockedGet,
    mockedPatch,
    mockedPost,
} from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const CREDENTIALS: LoginRequest = { login: "claude", password: "12345678" };
const REGISTRATION: RegisterRequest = {
    name: "Cl",
    surname: "Aude",
    login: "claude",
    email: "claude@example.com",
    password: "12345678",
};

describe("authApi", () => {
    it("should check the current session", async () => {
        mockedGet.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.auth.me, {
            params: undefined,
        });
    });

    it("should log in", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.login.initiate(CREDENTIALS));

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.auth.login,
            CREDENTIALS,
        );
    });

    it("should register", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.register.initiate(REGISTRATION));

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.auth.register,
            REGISTRATION,
        );
    });

    it("should invalidate the cached session after registering, so a stale unauthenticated result isn't reused", async () => {
        mockedGet.mockResolvedValue({ data: null });
        mockedPost.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.getMe.initiate(null));
        const callsAfterFirstFetch = mockedGet.mock.calls.length;

        await store.dispatch(authApi.endpoints.register.initiate(REGISTRATION));
        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(mockedGet.mock.calls.length).toBeGreaterThan(
            callsAfterFirstFetch,
        );
    });

    it("should log out", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.logout.initiate(null));

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.auth.logout,
            undefined,
        );
    });

    it("should update the profile", async () => {
        mockedPatch.mockResolvedValue({ data: null });
        const store = makeTestStore();
        const data: UpdateProfileRequest = {
            name: "Claude",
            surname: "Cook",
            avatar: "tomato",
        };

        await store.dispatch(authApi.endpoints.updateProfile.initiate(data));

        expect(mockedPatch).toHaveBeenCalledWith(API_ROUTES.auth.me, data);
    });

    it("should invalidate the cached session after updating the profile", async () => {
        mockedGet.mockResolvedValue({ data: null });
        mockedPatch.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.getMe.initiate(null));
        const callsAfterFirstFetch = mockedGet.mock.calls.length;

        await store.dispatch(
            authApi.endpoints.updateProfile.initiate({
                name: "Claude",
                surname: "Cook",
                avatar: null,
            }),
        );
        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(mockedGet.mock.calls.length).toBeGreaterThan(
            callsAfterFirstFetch,
        );
    });

    it("should delete the account", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();
        const data: DeleteAccountRequest = { password: "secret1!" };

        await store.dispatch(authApi.endpoints.deleteAccount.initiate(data));

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.auth.me, {
            data,
            params: undefined,
        });
    });
});
