import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";
import { caloriesApi } from "redux/services/caloriesApi";

import { useCalorieBudget } from "hooks/useCalorieBudget";

import { getTodayRange } from "utils/calorieDateRange";

import { makeAxiosError, mockedGet, mockGetByUrl } from "test/apiClientMock";
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

const setup = async (user: CurrentUser, entries: { calories: number }[]) => {
    mockGetByUrl({
        [API_ROUTES.auth.me]: user,
        [API_ROUTES.calories.intake]: entries,
    });

    const store = makeTestStore();
    const range = getTodayRange();

    await Promise.all([
        store.dispatch(authApi.endpoints.getMe.initiate(null)),
        store.dispatch(caloriesApi.endpoints.getCalorieIntake.initiate(range)),
    ]);

    return renderHookWithStore(() => useCalorieBudget(), store).result;
};

describe("useCalorieBudget", () => {
    it("should compute consumed and remaining against the user's daily goal", async () => {
        const result = await setup(CURRENT_USER, [{ calories: 300 }]);

        expect(result.current.consumed).toBe(300);
        expect(result.current.goal).toBe(2000);
        expect(result.current.remaining).toBe(1700);
    });

    it("should report null goal-relative fields when the user has no goal", async () => {
        const result = await setup({ ...CURRENT_USER, calorie_goal: null }, [
            { calories: 300 },
        ]);

        expect(result.current.consumed).toBe(300);
        expect(result.current.goal).toBeNull();
        expect(result.current.remaining).toBeNull();
    });

    it("should skip the calorie-intake request and report an empty budget for a guest", () => {
        // /api/me also 401s for a guest - a real axios error, so it doesn't clobber the seeded
        // "guest" status back to "error" via the getMe.matchRejected matcher (see sessionSlice)
        mockedGet.mockRejectedValue(makeAxiosError(401, "Unauthorized"));
        const store = makeTestStore({ session: { status: "guest" } });

        const { result } = renderHookWithStore(() => useCalorieBudget(), store);

        expect(result.current.consumed).toBe(0);
        expect(result.current.goal).toBeNull();
        expect(mockedGet).not.toHaveBeenCalledWith(
            API_ROUTES.calories.intake,
            expect.anything(),
        );
    });
});
