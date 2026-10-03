import type { RegisterRequest, UpdateProfileRequest } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";

import {
    mockedDelete,
    mockedGet,
    mockedPatch,
    mockedPost,
} from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

type TestStore = ReturnType<typeof makeTestStore>;

const REGISTRATION: RegisterRequest = {
    name: "Cl",
    surname: "Aude",
    login: "claude",
    email: "claude@example.com",
    password: "12345678",
};
const PROFILE: UpdateProfileRequest = {
    name: "Claude",
    surname: "Cook",
    avatar: null,
};

describe("authApi", () => {
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

    it("should invalidate the cached session after updating the profile", async () => {
        mockedGet.mockResolvedValue({ data: null });
        mockedPatch.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.getMe.initiate(null));
        const callsAfterFirstFetch = mockedGet.mock.calls.length;

        await store.dispatch(authApi.endpoints.updateProfile.initiate(PROFILE));
        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(mockedGet.mock.calls.length).toBeGreaterThan(
            callsAfterFirstFetch,
        );
    });

    // a refetch here would unmount the modal that shows the error
    it.each([
        [
            "a profile update",
            (store: TestStore) =>
                store.dispatch(
                    authApi.endpoints.updateProfile.initiate(PROFILE),
                ),
        ],
        [
            "an account deletion",
            (store: TestStore) =>
                store.dispatch(
                    authApi.endpoints.deleteAccount.initiate({
                        password: "wrong",
                    }),
                ),
        ],
    ])(
        "should not refetch the session when %s fails",
        async (_change, write) => {
            mockedGet.mockResolvedValue({ data: null });
            mockedPatch.mockRejectedValue(new Error("offline"));
            mockedDelete.mockRejectedValue(new Error("offline"));
            const store = makeTestStore();
            const me = store.dispatch(authApi.endpoints.getMe.initiate(null));

            await me;
            mockedGet.mockClear();

            await write(store);
            await store.dispatch(authApi.endpoints.getMe.initiate(null));

            expect(mockedGet).not.toHaveBeenCalled();
            me.unsubscribe();
        },
    );

    it("should refetch cached recipes and menus after the profile changes, since cards show their author", async () => {
        mockedGet.mockResolvedValue({ data: null });
        mockedPatch.mockResolvedValue({ data: null });
        const store = makeTestStore();
        const recipe = store.dispatch(
            recipesApi.endpoints.getRecipeById.initiate("5"),
        );
        const menu = store.dispatch(menusApi.endpoints.getMenuById.initiate(9));

        await Promise.all([recipe, menu]);
        mockedGet.mockClear();

        await store.dispatch(authApi.endpoints.updateProfile.initiate(PROFILE));
        await Promise.all([
            store.dispatch(recipesApi.endpoints.getRecipeById.initiate("5")),
            store.dispatch(menusApi.endpoints.getMenuById.initiate(9)),
        ]);

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.recipes.byId("5"), {
            params: undefined,
        });
        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.menu.byId(9), {
            params: undefined,
        });
        recipe.unsubscribe();
        menu.unsubscribe();
    });
});
