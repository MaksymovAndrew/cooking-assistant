import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import { CalorieHistoryChart } from "components/calories/CalorieHistoryChart";

import { mockGetByUrl } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const NOW = new Date(2026, 0, 14, 12, 0, 0);
const GOAL_LABEL = "Goal 2,000 kcal";

const isoOnDay = (dayOffset: number) =>
    new Date(2026, 0, 14 - dayOffset, 18, 0, 0).toISOString();

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
});

afterEach(() => {
    jest.useRealTimers();
});

describe("CalorieHistoryChart", () => {
    it("should render 7 day bars and the streak from the fetched entries", async () => {
        mockGetByUrl({
            [API_ROUTES.calories.intake]: [
                {
                    id: 1,
                    title: "Lunch",
                    portions: 1,
                    calories: 1000,
                    eaten_at: isoOnDay(0),
                    recipe_id: 1,
                    menu_id: null,
                    person_id: 1,
                },
                {
                    id: 2,
                    title: "Dinner",
                    portions: 1,
                    calories: 1800,
                    eaten_at: isoOnDay(1),
                    recipe_id: 1,
                    menu_id: null,
                    person_id: 1,
                },
                {
                    id: 3,
                    title: "Feast",
                    portions: 1,
                    calories: 2600,
                    eaten_at: isoOnDay(2),
                    recipe_id: 1,
                    menu_id: null,
                    person_id: 1,
                },
            ],
        });

        renderWithRouter(<CalorieHistoryChart goal={2000} />);

        expect(await screen.findByText("1,000")).toBeInTheDocument();
        expect(screen.getByText("1,800")).toBeInTheDocument();
        expect(screen.getByText("2,600")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("Today")).toBeInTheDocument();
        expect(screen.getByText(GOAL_LABEL)).toBeInTheDocument();
    });

    it("should show the empty state overlaid on the same bars/footer skeleton, not in place of it", async () => {
        mockGetByUrl({ [API_ROUTES.calories.intake]: [] });

        renderWithRouter(<CalorieHistoryChart goal={2000} />);

        expect(await screen.findByText("No history yet.")).toBeInTheDocument();
        // the footer still renders (same height as a populated chart), just with the goal line
        expect(screen.getByText(GOAL_LABEL)).toBeInTheDocument();
        // each day column shows a dash instead of a misleading "0"
        expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    });

    it("should show dashes instead of numbers in the 30-day footer when there is no history", async () => {
        jest.useRealTimers();
        mockGetByUrl({ [API_ROUTES.calories.intake]: [] });

        renderWithRouter(<CalorieHistoryChart goal={2000} />);

        await screen.findByText("No history yet.");
        await userEvent.click(screen.getByRole("radio", { name: "30 days" }));

        expect(await screen.findByText("Daily average —")).toBeInTheDocument();
        expect(screen.getByText("Days on goal —/30")).toBeInTheDocument();
    });

    it("should switch to the 30-day view and show the footer stats", async () => {
        jest.useRealTimers();
        mockGetByUrl({
            [API_ROUTES.calories.intake]: [
                {
                    id: 1,
                    title: "Lunch",
                    portions: 1,
                    calories: 1000,
                    eaten_at: new Date().toISOString(),
                    recipe_id: 1,
                    menu_id: null,
                    person_id: 1,
                },
            ],
        });

        renderWithRouter(<CalorieHistoryChart goal={2000} />);

        await screen.findByText("1,000");

        await userEvent.click(screen.getByRole("radio", { name: "30 days" }));

        expect(await screen.findByText(/Days on goal/)).toBeInTheDocument();
        expect(screen.getByText(GOAL_LABEL)).toBeInTheDocument();
    });
});
