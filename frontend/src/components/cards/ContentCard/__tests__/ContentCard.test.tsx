import { screen } from "@testing-library/react";
import { Calendar, Clock, UtensilsCrossed } from "lucide-react";

import { FAVOURITE_TARGET } from "constants/favourites";

import { ContentCard } from "components/cards/ContentCard";

import { renderWithRouter } from "test/router";

const COOKING_TIME_LABEL = "1 hr : 25 min";

const renderCard = (
    props: Partial<React.ComponentProps<typeof ContentCard>> = {},
) =>
    renderWithRouter(
        <ContentCard
            href="/recipe/1"
            title="Slow-roasted ragù"
            imageIcon={UtensilsCrossed}
            chipLabel="Main course"
            metaItems={[{ icon: Clock, label: COOKING_TIME_LABEL }]}
            {...props}
        />,
    );

describe("ContentCard", () => {
    it("should render the title as a link to the given destination", () => {
        renderCard();

        expect(
            screen.getByRole("link", { name: /Slow-roasted ragù/ }),
        ).toHaveAttribute("href", "/recipe/1");
    });

    it("should render the chip label", () => {
        renderCard();

        expect(screen.getByText("Main course")).toBeInTheDocument();
    });

    it("should mark the language the record is written in", () => {
        renderCard({ language: "pl" });

        expect(screen.getByTitle("In Polish")).toHaveTextContent("PL");
    });

    it("should leave the language badge out when the record has none", () => {
        renderCard();

        expect(screen.queryByTitle(/^In /)).not.toBeInTheDocument();
    });

    it("should render every meta item's label", () => {
        renderCard();

        expect(screen.getByText(COOKING_TIME_LABEL)).toBeInTheDocument();
    });

    it("should not render a heart without a favourite state", () => {
        renderCard();

        expect(
            screen.queryByRole("button", { name: "Favourite" }),
        ).not.toBeInTheDocument();
    });

    it("should render a pressed heart outside the title link for a favourited card", () => {
        renderCard({
            favourite: {
                target: FAVOURITE_TARGET.recipe,
                id: 1,
                isFavourite: true,
            },
        });

        const heart = screen.getByRole("button", { name: "Favourite" });

        expect(heart).toHaveAttribute("aria-pressed", "true");
        expect(
            screen.getByRole("link", { name: "Slow-roasted ragù" }),
        ).not.toContainElement(heart);
    });

    it("should show the average and the vote count in the grid variant", () => {
        renderCard({ rating: { average: 4.25, count: 12 } });

        expect(screen.getByText("4.3")).toBeInTheDocument();
        expect(screen.getByText("(12)")).toBeInTheDocument();
        expect(
            screen.getByText("Rated 4.3 out of 5 from 12 ratings"),
        ).toBeInTheDocument();
    });

    it("should say a record has no ratings yet rather than show a zero", () => {
        renderCard({ rating: { average: null, count: 0 } });

        expect(screen.getByText("No ratings yet")).toBeInTheDocument();
    });

    it("should not show a star rating in the row variant", () => {
        renderCard({ variant: "row", rating: { average: 4.25, count: 12 } });

        expect(screen.queryByText("4.3")).not.toBeInTheDocument();
    });

    it("should only show the first meta item in the row variant", () => {
        renderCard({
            variant: "row",
            metaItems: [
                { icon: Clock, label: COOKING_TIME_LABEL },
                { icon: Calendar, label: "Mar 12, 2026" },
            ],
        });

        expect(screen.getByText(COOKING_TIME_LABEL)).toBeInTheDocument();
        expect(screen.queryByText("Mar 12, 2026")).not.toBeInTheDocument();
    });

    it("should show an uploaded photo in place of the icon", () => {
        renderCard({ imageSrc: "blob:test/photo" });

        expect(screen.getByRole("presentation")).toHaveAttribute(
            "src",
            "blob:test/photo",
        );
    });
});
