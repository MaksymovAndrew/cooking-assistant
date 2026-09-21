import { screen } from "@testing-library/react";

import { RatingStars } from "components/ui/RatingStars";

import { renderWithRouter } from "test/router";

describe("RatingStars", () => {
    it("should describe the average and the vote count as one image", () => {
        renderWithRouter(<RatingStars average={3.5} count={1} />);

        expect(
            screen.getByRole("img", {
                name: "Rated 3.5 out of 5 from 1 rating",
            }),
        ).toBeInTheDocument();
    });

    it("should say there are no ratings yet for an unrated record", () => {
        renderWithRouter(<RatingStars average={null} count={0} />);

        expect(
            screen.getByRole("img", { name: "No ratings yet" }),
        ).toBeInTheDocument();
    });
});
