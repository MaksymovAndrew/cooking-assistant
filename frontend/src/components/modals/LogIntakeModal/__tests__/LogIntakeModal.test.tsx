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
    meal_calorie_limit: 500,
};

const setup = (user: CurrentUser = CURRENT_USER) => {
    mockGetByUrl({ [API_ROUTES.auth.me]: user });

    const store = makeTestStore({
        ui: {
            modal: {
                id: "m1",
                type: "logIntake",
                recipeId: 7,
                title: ENTRY_TITLE,
                caloriesPerPortion: 620,
            },
        },
    });

    return renderWithProviders(
        <LogIntakeModal
            modalId="m1"
            recipeId={7}
            title={ENTRY_TITLE}
            caloriesPerPortion={620}
        />,
        { store },
    );
};

describe("LogIntakeModal", () => {
    it("should show the recipe title and the total for one portion", () => {
        setup();

        expect(screen.getByText(ENTRY_TITLE)).toBeInTheDocument();
        expect(screen.getByText("620 kcal total")).toBeInTheDocument();
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

        expect(screen.getByText("620 kcal total")).toBeInTheDocument();
    });

    it("should warn once the total exceeds the per-meal limit", async () => {
        setup();

        expect(
            screen.queryByText(/over your per-meal limit/),
        ).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: "More portions" }),
        );

        expect(
            await screen.findByText(
                "That's 740 kcal over your per-meal limit.",
            ),
        ).toBeInTheDocument();
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
