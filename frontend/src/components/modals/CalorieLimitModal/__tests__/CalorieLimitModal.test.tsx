import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { profileDietaryPath } from "constants/routes";

import { CalorieLimitModal } from "components/modals/CalorieLimitModal";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

describe("CalorieLimitModal", () => {
    it("should show the logged and over-goal amounts", () => {
        renderWithProviders(
            <CalorieLimitModal modalId="m1" consumed={2520} goal={2200} />,
        );

        expect(
            screen.getByText("You're over today's goal"),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "You've logged 2,520 kcal - 320 kcal over your 2,200 kcal goal.",
            ),
        ).toBeInTheDocument();
    });

    it("should link the adjust-goal button to the profile dietary tab", () => {
        renderWithProviders(
            <CalorieLimitModal modalId="m1" consumed={2520} goal={2200} />,
        );

        expect(
            screen.getByRole("link", { name: "Adjust goal" }),
        ).toHaveAttribute("href", profileDietaryPath());
    });

    it("should close the modal when Got it is clicked", async () => {
        const store = makeTestStore({
            ui: {
                modal: {
                    id: "m1",
                    type: "calorieLimit",
                    consumed: 2520,
                    goal: 2200,
                },
            },
        });

        renderWithProviders(
            <CalorieLimitModal modalId="m1" consumed={2520} goal={2200} />,
            { store },
        );

        await userEvent.click(screen.getByRole("button", { name: "Got it" }));

        expect(store.getState().ui.modal).toBeNull();
    });
});
