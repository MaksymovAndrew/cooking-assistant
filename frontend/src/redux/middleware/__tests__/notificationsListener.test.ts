import { getErrorMessage } from "redux/middleware/notificationsListener";
import { authApi } from "redux/services/authApi";
import { caloriesApi } from "redux/services/caloriesApi";
import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";
import { userIngredientsApi } from "redux/services/userIngredientsApi";

import {
    mockedDelete,
    mockedPatch,
    mockedPost,
    mockedPut,
} from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const REQUEST_FAILED_MESSAGE = "Request failed";
const BAD_CREDENTIALS_ERROR = "Bad credentials";
const FALLBACK_ERROR_MESSAGE = "Something went wrong";
const NEW_PASSWORD = "new-secret1!";
const CURRENT_PASSWORD_INCORRECT_ERROR = "Current password is incorrect";

describe("getErrorMessage", () => {
    it("should return the data message from a query error payload", () => {
        expect(getErrorMessage({ status: 404, data: "Not found" })).toBe(
            "Not found",
        );
    });

    it("should fall back for a null payload", () => {
        expect(getErrorMessage(null)).toBe(FALLBACK_ERROR_MESSAGE);
    });

    it("should fall back for an object without a data field", () => {
        expect(getErrorMessage({ status: 500 })).toBe(FALLBACK_ERROR_MESSAGE);
    });

    it("should fall back when data is not a string", () => {
        expect(getErrorMessage({ data: 123 })).toBe(FALLBACK_ERROR_MESSAGE);
    });
});

describe("notificationsListener", () => {
    it("should add an error notification when a request fails", async () => {
        mockedDelete.mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 500,
                data: { error: BAD_CREDENTIALS_ERROR },
            },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeTestStore();

        await store.dispatch(recipesApi.endpoints.deleteRecipe.initiate("5"));

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "error",
            message: BAD_CREDENTIALS_ERROR,
        });
    });

    it("should add an error notification when a deleteAccount request fails", async () => {
        mockedDelete.mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 401,
                data: { error: CURRENT_PASSWORD_INCORRECT_ERROR },
            },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeTestStore();

        await store.dispatch(
            authApi.endpoints.deleteAccount.initiate({ password: "wrong" }),
        );

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "error",
            message: CURRENT_PASSWORD_INCORRECT_ERROR,
        });
    });

    it("should not add a notification when a login request fails", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 401,
                data: { error: BAD_CREDENTIALS_ERROR },
            },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeTestStore();

        await store.dispatch(
            authApi.endpoints.login.initiate({ login: "a", password: "b" }),
        );

        expect(store.getState().notifications.items).toEqual([]);
    });

    it("should not add a notification when a register request fails", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: { status: 409, data: { error: "exists" } },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeTestStore();

        await store.dispatch(
            authApi.endpoints.register.initiate({
                name: "Test",
                surname: "User",
                login: "tester",
                email: "tester@example.com",
                password: "secret1",
            }),
        );

        expect(store.getState().notifications.items).toEqual([]);
    });

    it("should not add a notification when a getMe request fails", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: { status: 401, data: { error: "Unauthorized" } },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.getMe.initiate(null));

        expect(store.getState().notifications.items).toEqual([]);
    });

    it("should not add a notification when a logout request fails", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 500,
                data: { error: BAD_CREDENTIALS_ERROR },
            },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.logout.initiate(null));

        expect(store.getState().notifications.items).toEqual([]);
    });

    it("should not add a notification when a forgotPassword request fails", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: { status: 429, data: { error: "Too many requests" } },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeTestStore();

        await store.dispatch(
            authApi.endpoints.forgotPassword.initiate({
                email: "tester@example.com",
            }),
        );

        expect(store.getState().notifications.items).toEqual([]);
    });

    it("should not add a notification when a resetPassword request fails", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: { status: 401, data: { error: "Invalid token" } },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeTestStore();

        await store.dispatch(
            authApi.endpoints.resetPassword.initiate({
                token: "bad-token",
                newPassword: NEW_PASSWORD,
            }),
        );

        expect(store.getState().notifications.items).toEqual([]);
    });

    it("should not add a notification when a changePassword request fails", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 401,
                data: { error: CURRENT_PASSWORD_INCORRECT_ERROR },
            },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeTestStore();

        await store.dispatch(
            authApi.endpoints.changePassword.initiate({
                currentPassword: "wrong",
                newPassword: NEW_PASSWORD,
            }),
        );

        expect(store.getState().notifications.items).toEqual([]);
    });

    it("should not add a notification when an updateProfile request fails", async () => {
        mockedPatch.mockRejectedValue({
            isAxiosError: true,
            response: { status: 400, data: { error: "Invalid" } },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeTestStore();

        await store.dispatch(
            authApi.endpoints.updateProfile.initiate({
                name: "Claude",
                surname: "Cook",
                avatar: null,
            }),
        );

        expect(store.getState().notifications.items).toEqual([]);
    });

    it("should not add a notification when an updateCalorieGoal request fails", async () => {
        mockedPut.mockRejectedValue({
            isAxiosError: true,
            response: { status: 400, data: { error: "Invalid" } },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeTestStore();

        await store.dispatch(
            caloriesApi.endpoints.updateCalorieGoal.initiate({
                calorie_goal: 2200,
            }),
        );

        expect(store.getState().notifications.items).toEqual([]);
    });

    it("should add a success notification when logout succeeds", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(authApi.endpoints.logout.initiate(null));

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "success",
            message: "You have been logged out",
        });
    });
});

describe("notificationsListener success toasts", () => {
    it("should add a success notification when a recipe is deleted", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(recipesApi.endpoints.deleteRecipe.initiate("5"));

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "success",
            message: "Recipe deleted",
        });
    });

    it("should add a success notification when the password is changed", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            authApi.endpoints.changePassword.initiate({
                currentPassword: "old-secret",
                newPassword: NEW_PASSWORD,
            }),
        );

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "success",
            message: "Password changed",
        });
    });

    it("should add a success notification when the profile is updated", async () => {
        mockedPatch.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            authApi.endpoints.updateProfile.initiate({
                name: "Claude",
                surname: "Cook",
                avatar: "tomato",
            }),
        );

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "success",
            message: "Profile updated",
        });
    });

    it("should add a success notification when the account is deleted", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            authApi.endpoints.deleteAccount.initiate({ password: "secret1!" }),
        );

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "success",
            message: "Account deleted",
        });
    });

    it("should add a success notification when a menu is deleted", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(menusApi.endpoints.deleteMenu.initiate(3));

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "success",
            message: "Menu deleted",
        });
    });

    it("should add a success notification when a user ingredient is deleted", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            userIngredientsApi.endpoints.deleteUserIngredient.initiate(7),
        );

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "success",
            message: "Ingredient deleted",
        });
    });

    it("should add a success notification when a calorie intake entry is deleted", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            caloriesApi.endpoints.deleteCalorieIntake.initiate(9),
        );

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "success",
            message: "Entry deleted",
        });
    });

    it("should add a success notification when intake is logged", async () => {
        mockedPost.mockResolvedValue({
            data: {
                id: 1,
                person_id: 1,
                recipe_id: 7,
                menu_id: null,
                title: "Chicken teriyaki don",
                portions: 1,
                calories: 620,
                eaten_at: new Date().toISOString(),
            },
        });
        const store = makeTestStore();

        await store.dispatch(
            caloriesApi.endpoints.logCalorieIntake.initiate({
                recipe_id: 7,
                portions: 1,
            }),
        );

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "success",
            message: "Logged to today's intake",
        });
    });

    it("should add a success notification when user ingredients are saved", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            userIngredientsApi.endpoints.saveUserIngredient.initiate({
                ingredients: [
                    {
                        id: 1,
                        ingredient_name: "Salt",
                        quantity_person_ingradient: 2,
                    },
                ],
            }),
        );

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "success",
            message: "Ingredients saved",
        });
    });

    it("should add a success notification when ingredient quantities are updated", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            userIngredientsApi.endpoints.updateQuantities.initiate({
                updatedIngredients: [
                    {
                        id: 1,
                        slug: "salt",
                        category: "spices",
                        unit_name: "g",
                        quantity_person_ingradient: 3,
                        allergens: [],
                    },
                ],
            }),
        );

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "success",
            message: "Quantities updated",
        });
    });

    it("should add a success notification when a purchase is saved", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(
            userIngredientsApi.endpoints.updatePurchase.initiate({
                purchaseId: 11,
                body: { quantity: 5 },
            }),
        );

        const { items } = store.getState().notifications;

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            type: "success",
            message: "Purchase saved",
        });
    });
});
