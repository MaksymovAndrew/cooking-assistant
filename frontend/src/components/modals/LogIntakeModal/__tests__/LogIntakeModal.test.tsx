import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { LogIntakeModal } from "components/modals/LogIntakeModal";

import { mockedPost, mockGetByUrl } from "test/apiClientMock";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const ENTRY_TITLE = "Chicken teriyaki don";
const ONE_PORTION_TOTAL = "620 kcal total";

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

const setup = (
    user: CurrentUser = CURRENT_USER,
    entries: { calories: number }[] = [],
    initialPortions?: number,
) => {
    mockGetByUrl({
        [API_ROUTES.auth.me]: user,
        [API_ROUTES.calories.intake]: entries,
    });

    const store = makeTestStore({
        ui: {
            modal: {
                id: "m1",
                type: "logIntake",
                recipeId: 7,
                title: ENTRY_TITLE,
                caloriesPerPortion: 620,
                initialPortions,
            },
        },
    });

    return renderWithProviders(
        <LogIntakeModal
            modalId="m1"
            recipeId={7}
            title={ENTRY_TITLE}
            caloriesPerPortion={620}
            initialPortions={initialPortions}
        />,
        { store },
    );
};

describe("LogIntakeModal", () => {
    it("should show the recipe title and the total for one portion", () => {
        setup();

        expect(screen.getByText(ENTRY_TITLE)).toBeInTheDocument();
        expect(screen.getByText(ONE_PORTION_TOTAL)).toBeInTheDocument();
    });

    it("should scale the total when portions are incremented", async () => {
        setup();

        await userEvent.click(
            screen.getByRole("button", { name: "More portions" }),
        );

        expect(screen.getByText("1,240 kcal total")).toBeInTheDocument();
    });

    it("should not go below one portion", async () => {
        setup();

        await userEvent.click(
            screen.getByRole("button", { name: "Fewer portions" }),
        );

        expect(screen.getByText(ONE_PORTION_TOTAL)).toBeInTheDocument();
    });

    it("should start from the portions already selected on the recipe/menu page", () => {
        setup(CURRENT_USER, [], 3);

        expect(screen.getByText("1,860 kcal total")).toBeInTheDocument();
    });

    it("should show today's goal and remaining budget", async () => {
        setup(CURRENT_USER, [{ calories: 300 }]);

        expect(
            await screen.findByText(
                "You've eaten 300 kcal of your 2,000 kcal goal - 1,700 kcal left.",
            ),
        ).toBeInTheDocument();
    });

    it("should warn once this entry would push the day over the goal", async () => {
        // consumed 1200 of 2000 leaves 800 remaining - one portion (620) fits, two (1240) don't
        setup(CURRENT_USER, [{ calories: 1200 }]);

        expect(
            screen.queryByText(/kcal over your goal for today/),
        ).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: "More portions" }),
        );

        expect(
            await screen.findByText(
                "This would put you 440 kcal over your goal for today.",
            ),
        ).toBeInTheDocument();
    });

    it("should not show a budget summary when there is no calorie goal", async () => {
        setup({ ...CURRENT_USER, calorie_goal: null }, [{ calories: 1500 }]);

        expect(await screen.findByText(ONE_PORTION_TOTAL)).toBeInTheDocument();
        expect(
            screen.queryByText(/kcal of your.*kcal goal/),
        ).not.toBeInTheDocument();
    });

    it("should log the intake and close on confirm", async () => {
        mockedPost.mockResolvedValue({
            data: {
                id: 1,
                person_id: 1,
                recipe_id: 7,
                menu_id: null,
                title: ENTRY_TITLE,
                portions: 1,
                calories: 620,
                eaten_at: new Date().toISOString(),
            },
        });
        const { store } = setup();

        await userEvent.click(screen.getByRole("button", { name: "Log it" }));

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.calories.intake, {
            recipe_id: 7,
            menu_id: undefined,
            portions: 1,
        });
        expect(store.getState().ui.modal).toBeNull();
    });

    it("should close without logging on cancel", async () => {
        const { store } = setup();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(mockedPost).not.toHaveBeenCalled();
        expect(store.getState().ui.modal).toBeNull();
    });
});
