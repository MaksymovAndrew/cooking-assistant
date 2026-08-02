import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { CalorieIntakeItem } from "types/calorie";

import { MODAL_TYPE } from "redux/slices/uiSlice";

import { CalorieJournal } from "components/calories/CalorieJournal";

import { renderWithRouter } from "test/router";

const ENTRY_TITLE = "Chicken teriyaki don";

const ENTRY: CalorieIntakeItem = {
    id: 1,
    person_id: 1,
    recipe_id: 2,
    menu_id: null,
    title: ENTRY_TITLE,
    portions: 1,
    calories: 620,
    eaten_at: new Date().toISOString(),
};

describe("CalorieJournal", () => {
    it("should show the empty state when there are no entries", () => {
        renderWithRouter(<CalorieJournal entries={[]} mealLimit={null} />);

        expect(
            screen.getByText("You haven't logged anything today."),
        ).toBeInTheDocument();
    });

    it("should list entries with title, portions and calories", () => {
        renderWithRouter(
            <CalorieJournal
                entries={[ENTRY, { ...ENTRY, id: 2, portions: 2 }]}
                mealLimit={null}
            />,
        );

        expect(screen.getByText(ENTRY_TITLE)).toBeInTheDocument();
        expect(screen.getByText(`×2 ${ENTRY_TITLE}`)).toBeInTheDocument();
        expect(screen.getAllByText("620")).toHaveLength(2);
        expect(screen.getByText("2 entries · 1,240 kcal")).toBeInTheDocument();
    });

    it("should flag an entry that exceeds the per-meal limit", () => {
        renderWithRouter(<CalorieJournal entries={[ENTRY]} mealLimit={500} />);

        expect(screen.getByText(/over per-meal limit/)).toBeInTheDocument();
    });

    it("should open the delete-confirmation modal when the trash button is clicked", async () => {
        const { store } = renderWithRouter(
            <CalorieJournal entries={[ENTRY]} mealLimit={null} />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Delete entry" }),
        );

        expect(store.getState().ui.modal).toMatchObject({
            type: MODAL_TYPE.deleteCalorieIntake,
            intakeId: 1,
            title: ENTRY_TITLE,
        });
    });
});
