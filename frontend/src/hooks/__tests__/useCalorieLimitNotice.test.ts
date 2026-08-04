import { act } from "@testing-library/react";

import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { caloriesApi } from "redux/services/caloriesApi";
import { closeModal, MODAL_TYPE } from "redux/slices/uiSlice";

import { useCalorieLimitNotice } from "hooks/useCalorieLimitNotice";

import { getTodayRange } from "utils/calorieDateRange";
import { markCalorieLimitNoticeShown } from "utils/calorieLimitNoticeStorage";

import { mockGetByUrl } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

// fixed "now" so the range this test pre-dispatches exactly matches what the hook computes itself
const NOW = new Date(2026, 0, 14, 15, 30);

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
});

afterEach(() => {
    jest.useRealTimers();
});

const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
    calorie_goal: 2200,
};

const setup = async (
    entries: { calories: number }[],
    sessionStatus: "authed" | "checking" = "authed",
    user: CurrentUser = CURRENT_USER,
) => {
    mockGetByUrl({
        [API_ROUTES.auth.me]: user,
        [API_ROUTES.calories.intake]: entries,
    });

    const store = makeTestStore({ session: { status: sessionStatus } });

    if (sessionStatus === "authed") {
        await Promise.all([
            store.dispatch(authApi.endpoints.getMe.initiate(null)),
            store.dispatch(
                caloriesApi.endpoints.getCalorieIntake.initiate(
                    getTodayRange(),
                ),
            ),
        ]);
    }

    return renderHookWithStore(() => {
        useCalorieLimitNotice();
    }, store);
};

describe("useCalorieLimitNotice", () => {
    it("should open the calorie-limit modal once today's intake crosses the goal", async () => {
        const { store } = await setup([{ calories: 2500 }]);

        expect(store.getState().ui.modal).toMatchObject({
            type: MODAL_TYPE.calorieLimit,
            consumed: 2500,
            goal: 2200,
        });
    });

    it("should not open a modal when under the goal", async () => {
        const { store } = await setup([{ calories: 1000 }]);

        expect(store.getState().ui.modal).toBeNull();
    });

    it("should not open a modal when there is no goal set", async () => {
        const { store } = await setup([{ calories: 2500 }], "authed", {
            ...CURRENT_USER,
            calorie_goal: null,
        });

        expect(store.getState().ui.modal).toBeNull();
    });

    it("should not open a modal while the session is still checking", async () => {
        const { store } = await setup([{ calories: 2500 }], "checking");

        expect(store.getState().ui.modal).toBeNull();
    });

    it("should not open the modal on a fresh page load if already shown earlier today", async () => {
        markCalorieLimitNoticeShown(CURRENT_USER.id, NOW.toDateString());

        const { store } = await setup([{ calories: 2500 }]);

        expect(store.getState().ui.modal).toBeNull();
    });

    it("should open the modal again on a new day even if it already fired the day before", async () => {
        const yesterday = new Date(2026, 0, 13);

        markCalorieLimitNoticeShown(CURRENT_USER.id, yesterday.toDateString());

        const { store } = await setup([{ calories: 2500 }]);

        expect(store.getState().ui.modal).toMatchObject({
            type: MODAL_TYPE.calorieLimit,
        });
    });

    it("should open the modal for a different user even if today's notice already fired for someone else", async () => {
        markCalorieLimitNoticeShown(999, NOW.toDateString());

        const { store } = await setup([{ calories: 2500 }]);

        expect(store.getState().ui.modal).toMatchObject({
            type: MODAL_TYPE.calorieLimit,
        });
    });

    it("should not reopen the modal on a later mount once already shown this session", async () => {
        const { store } = await setup([{ calories: 2500 }]);
        const openedModal = store.getState().ui.modal;

        expect(openedModal).not.toBeNull();

        act(() => {
            store.dispatch(closeModal(openedModal?.id ?? ""));
        });

        renderHookWithStore(() => {
            useCalorieLimitNotice();
        }, store);

        expect(store.getState().ui.modal).toBeNull();
    });
});
