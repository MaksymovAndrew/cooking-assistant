import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { ProfileDietaryTab } from "components/profile/ProfileDietaryTab";

import { mockedPut, mockGetByUrl } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const GOAL_LABEL = "Daily goal (kcal)";

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
    meal_calorie_limit: 800,
};

const setup = (
    user: CurrentUser = CURRENT_USER,
    entries: { calories: number }[] = [],
) => {
    mockGetByUrl({
        [API_ROUTES.auth.me]: user,
        [API_ROUTES.calories.intake]: entries,
    });

    return renderWithRouter(<ProfileDietaryTab currentUser={user} />);
};

describe("ProfileDietaryTab", () => {
    it("should render the goal form prefilled from the current user", () => {
        setup();

        expect(screen.getAllByText("Calorie goal")[0]).toBeInTheDocument();
        expect(screen.getByLabelText(GOAL_LABEL)).toHaveValue(2000);
        expect(
            screen.getByLabelText("Per-meal limit (kcal) (optional)"),
        ).toHaveValue(800);
    });

    it("should show the Today card once intake data has loaded", async () => {
        setup(CURRENT_USER, [{ calories: 500 }]);

        expect(
            await screen.findByText(
                "You've eaten 500 kcal of your 2,000 kcal goal - 1,500 kcal left.",
            ),
        ).toBeInTheDocument();
        expect(screen.getByText("On track")).toBeInTheDocument();
    });

    it("should show the over-limit message and tone when consumed exceeds the goal", async () => {
        setup(CURRENT_USER, [{ calories: 2500 }]);

        expect(
            await screen.findByText(
                "You've eaten 2,500 kcal, 500 kcal over your 2,000 kcal goal.",
            ),
        ).toBeInTheDocument();
        expect(screen.getByText("Over goal")).toBeInTheDocument();
    });

    it("should show only the goal form when no goal is set", () => {
        setup({
            ...CURRENT_USER,
            calorie_goal: null,
        });

        expect(
            screen.getByText("Set a daily goal to start tracking."),
        ).toBeInTheDocument();
        expect(screen.queryByText("Today")).not.toBeInTheDocument();
    });

    it("should save an updated goal and show the saved indicator", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup();

        await userEvent.clear(screen.getByLabelText(GOAL_LABEL));
        await userEvent.type(screen.getByLabelText(GOAL_LABEL), "2200");
        await userEvent.click(
            screen.getByRole("button", { name: "Save goal" }),
        );

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.calories.goal, {
            calorie_goal: 2200,
            meal_calorie_limit: 800,
        });
        expect(await screen.findByText("Saved just now")).toBeInTheDocument();
    });

    it("should always show the calorie disclaimer", () => {
        setup();

        expect(
            screen.getByText(/Calorie values are estimates/),
        ).toBeInTheDocument();
    });
});
