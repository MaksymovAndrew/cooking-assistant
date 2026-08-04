import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { caloriesApi } from "redux/services/caloriesApi";

import { useExceedsCalorieBudget } from "hooks/useExceedsCalorieBudget";

import { getTodayRange } from "utils/calorieDateRange";

import { mockGetByUrl } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

// fixed "now" so the range this test pre-dispatches exactly matches what the hook computes itself
const NOW = new Date(2026, 0, 14, 15, 30);

const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
    calorie_goal: 2000,
};

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
});

afterEach(() => {
    jest.useRealTimers();
});

const setup = async (
    caloriesPerPortion: number | null,
    portionCount: number | undefined,
    entries: { calories: number }[],
) => {
    mockGetByUrl({
        [API_ROUTES.auth.me]: CURRENT_USER,
        [API_ROUTES.calories.intake]: entries,
    });

    const store = makeTestStore();
    const range = getTodayRange();

    await Promise.all([
        store.dispatch(authApi.endpoints.getMe.initiate(null)),
        store.dispatch(caloriesApi.endpoints.getCalorieIntake.initiate(range)),
    ]);

    return renderHookWithStore(
        () => useExceedsCalorieBudget(caloriesPerPortion, portionCount),
        store,
    ).result;
};

describe("useExceedsCalorieBudget", () => {
    it("should be true when the scaled total exceeds what's left today", async () => {
        // 300/portion * 2 portions = 600, only 500 left of a 2000 goal after 1500 consumed
        const result = await setup(300, 2, [{ calories: 1500 }]);

        expect(result.current).toBe(true);
    });

    it("should be false when the scaled total fits within what's left today", async () => {
        const result = await setup(200, 2, [{ calories: 1500 }]);

        expect(result.current).toBe(false);
    });

    it("should default the portion count to 1 when not given", async () => {
        const result = await setup(600, undefined, [{ calories: 1500 }]);

        expect(result.current).toBe(true);
    });
});
