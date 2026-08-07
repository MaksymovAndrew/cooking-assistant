import type { CurrentUser } from "types/auth";

import { authApi } from "redux/services/authApi";
import { loggedOut, sessionReducer } from "redux/slices/sessionSlice";

import { makeAxiosError, mockedGet, mockedPost } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
    calorie_goal: null,
};

describe("sessionSlice", () => {
    it("should start in the checking status", () => {
        const state = sessionReducer(undefined, { type: "@@INIT" });

        expect(state.status).toBe("checking");
    });

    it("should set the status to guest on the loggedOut action", () => {
        const state = sessionReducer({ status: "authed" }, loggedOut());

        expect(state.status).toBe("guest");
    });

    it("should go checking while the initial session check is pending then authed on success", async () => {
        mockedGet.mockResolvedValue({ data: CURRENT_USER });
        const store = makeTestStore();

        const pending = store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().session.status).toBe("checking");

        await pending;

        expect(store.getState().session.status).toBe("authed");
    });

    it("should go checking while the initial session check is pending then guest on a null payload", async () => {
        mockedGet.mockResolvedValue({ data: null });
        const store = makeTestStore();

        const pending = store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().session.status).toBe("checking");

        await pending;

        expect(store.getState().session.status).toBe("guest");
    });

    it("should stay authed while a background getMe refetch is pending, not flash back to checking", async () => {
        mockedGet.mockResolvedValue({ data: CURRENT_USER });
        const store = makeTestStore({ session: { status: "authed" } });

        const pending = store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().session.status).toBe("authed");

        await pending;

        expect(store.getState().session.status).toBe("authed");
    });

    it("should stay guest while a background getMe refetch is pending, not flash back to checking", async () => {
        mockedGet.mockResolvedValue({ data: null });
        const store = makeTestStore({ session: { status: "guest" } });

        const pending = store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().session.status).toBe("guest");

        await pending;
    });

    it("should demote from authed to guest when a background getMe refetch resolves with a null payload", async () => {
        mockedGet.mockResolvedValue({ data: null });
        const store = makeTestStore({ session: { status: "authed" } });

        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().session.status).toBe("guest");
    });

    it("should stay guest if a background getMe refetch fails with a network error", async () => {
        mockedGet.mockRejectedValue(new Error("offline"));
        const store = makeTestStore({ session: { status: "guest" } });

        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().session.status).toBe("guest");
    });

    it("should set the status to error when the session check fails with a network error", async () => {
        mockedGet.mockRejectedValue(new Error("offline"));
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().session.status).toBe("error");
    });

    it("should set the status to guest when the session check unexpectedly fails with a 401", async () => {
        mockedGet.mockRejectedValue(makeAxiosError(401, "Unauthorized"));
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().session.status).toBe("guest");
    });

    it("should stay authed if a background getMe refetch fails with a network error", async () => {
        mockedGet.mockRejectedValue(new Error("offline"));
        const store = makeTestStore({ session: { status: "authed" } });

        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().session.status).toBe("authed");
    });

    it("should demote from authed to guest if a background getMe refetch unexpectedly fails with a 401", async () => {
        mockedGet.mockRejectedValue(makeAxiosError(401, "Unauthorized"));
        const store = makeTestStore({ session: { status: "authed" } });

        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().session.status).toBe("guest");
    });

    it("should set the status to guest when logout succeeds", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.logout.initiate(null));

        expect(store.getState().session.status).toBe("guest");
    });
});
