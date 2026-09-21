import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RatingControl } from "hooks/useRatingControl";

import { StarRatingInput } from "components/ui/StarRatingInput";

import { renderWithRouter } from "test/router";

const LABEL = "Your rating";
const THREE_STARS = "3 stars";
const REMOVE = "Remove my rating";

const setup = (overrides: Partial<RatingControl> = {}) => {
    const rating: RatingControl = {
        ratingAverage: null,
        ratingCount: 0,
        myRating: null,
        isDisabled: false,
        rate: jest.fn().mockResolvedValue(undefined),
        clear: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    };

    renderWithRouter(<StarRatingInput rating={rating} label={LABEL} />);

    return rating;
};

describe("StarRatingInput", () => {
    it("should offer five stars as one labelled group", () => {
        setup();

        expect(
            screen.getByRole("radiogroup", { name: LABEL }),
        ).toBeInTheDocument();
        expect(screen.getAllByRole("radio")).toHaveLength(5);
    });

    it("should vote with the pressed star", async () => {
        const rating = setup();

        await userEvent.click(screen.getByRole("radio", { name: THREE_STARS }));

        expect(rating.rate).toHaveBeenCalledWith(3);
    });

    it("should take the vote back when the chosen star is pressed again", async () => {
        const rating = setup({ myRating: 3 });

        await userEvent.click(screen.getByRole("radio", { name: THREE_STARS }));

        expect(rating.clear).toHaveBeenCalledTimes(1);
        expect(rating.rate).not.toHaveBeenCalled();
    });

    it("should show the remove control only to someone who has voted", () => {
        setup();

        expect(
            screen.queryByRole("button", { name: REMOVE }),
        ).not.toBeInTheDocument();
    });

    it("should take the vote back from the remove control", async () => {
        const rating = setup({ myRating: 4 });

        await userEvent.click(screen.getByRole("button", { name: REMOVE }));

        expect(rating.clear).toHaveBeenCalledTimes(1);
    });

    it("should move focus with the arrow keys and vote only on Enter", async () => {
        const rating = setup({ myRating: 2 });

        await userEvent.tab();

        expect(screen.getByRole("radio", { name: "2 stars" })).toHaveFocus();

        await userEvent.keyboard("{ArrowRight}");

        expect(screen.getByRole("radio", { name: THREE_STARS })).toHaveFocus();
        expect(rating.rate).not.toHaveBeenCalled();

        await userEvent.keyboard("{Enter}");

        expect(rating.rate).toHaveBeenCalledWith(3);
    });

    it("should jump to the last star with End and stay on it past the edge", async () => {
        setup();

        await userEvent.tab();
        await userEvent.keyboard("{End}{ArrowRight}");

        expect(screen.getByRole("radio", { name: "5 stars" })).toHaveFocus();

        await userEvent.keyboard("{Home}");

        expect(screen.getByRole("radio", { name: "1 star" })).toHaveFocus();
    });

    it("should disable every star while a vote is on its way", () => {
        setup({ isDisabled: true });

        for (const star of screen.getAllByRole("radio")) {
            expect(star).toBeDisabled();
        }
    });
});
