import { authApi } from "redux/services/authApi";
import { loggedOut, sessionReducer } from "redux/slices/sessionSlice";

import { mockedGet, mockedPost } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

describe("sessionSlice", () => {
    it("should start in the checking status", () => {
        const state = sessionReducer(undefined, { type: "@@INIT" });

        expect(state.status).toBe("checking");
    });

    it("should set the status to unauthed on the loggedOut action", () => {
        const state = sessionReducer({ status: "authed" }, loggedOut());

        expect(state.status).toBe("unauthed");
    });

    it("should go checking while the initial session check is pending then authed on success", async () => {
        mockedGet.mockResolvedValue({ data: null });
        const store = makeTestStore();

        const pending = store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().session.status).toBe("checking");

        await pending;

        expect(store.getState().session.status).toBe("authed");
    });

    it("should stay authed while a background getMe refetch is pending, not flash back to checking", async () => {
        mockedGet.mockResolvedValue({ data: null });
        const store = makeTestStore({ session: { status: "authed" } });

        const pending = store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().session.status).toBe("authed");

        await pending;

        expect(store.getState().session.status).toBe("authed");
    });

    it("should set the status to error when the session check fails", async () => {
        mockedGet.mockRejectedValue(new Error("offline"));
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().session.status).toBe("error");
    });

    it("should set the status to unauthed when logout succeeds", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.logout.initiate(null));

        expect(store.getState().session.status).toBe("unauthed");
    });
});
