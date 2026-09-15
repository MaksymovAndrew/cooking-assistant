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

    it("should render every meta item's label", () => {
        renderCard();

        expect(screen.getByText(COOKING_TIME_LABEL)).toBeInTheDocument();
    });

    it("should apply the mine class when mine is true", () => {
        renderCard({ mine: true });

        expect(screen.getByRole("article")).toHaveClass("content-card--mine");
    });

    it("should apply the badge class when badge is true", () => {
        renderCard({ badge: true });

        expect(screen.getByRole("article")).toHaveClass("content-card--badge");
    });

    it("should apply the calorie-over class when calorieOver is true", () => {
        renderCard({ calorieOver: true });

        expect(screen.getByRole("article")).toHaveClass(
            "content-card--calorie-over",
        );
    });

    it("should apply both classes when badge and calorieOver are both true", () => {
        renderCard({ badge: true, calorieOver: true });

        const card = screen.getByRole("article");

        expect(card).toHaveClass("content-card--badge");
        expect(card).toHaveClass("content-card--calorie-over");
    });

    it("should recolor a meta item tagged with the calorieOver tone", () => {
        renderCard({
            metaItems: [
                {
                    icon: Clock,
                    label: COOKING_TIME_LABEL,
                    tone: "calorieOver",
                },
            ],
        });

        expect(screen.getByText(COOKING_TIME_LABEL)).toHaveClass(
            "content-card__meta-item--calorie-over",
        );
    });

    it("should default to the grid variant", () => {
        renderCard();

        expect(screen.getByRole("article")).toHaveClass("content-card--grid");
    });

    it("should render the row variant when requested", () => {
        renderCard({ variant: "row" });

        expect(screen.getByRole("article")).toHaveClass("content-card--row");
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

    it("should show a star rating in the grid variant", () => {
        renderCard();

        expect(screen.getByText("4.2")).toBeInTheDocument();
    });

    it("should not show a star rating in the row variant", () => {
        renderCard({ variant: "row" });

        expect(screen.queryByText("4.2")).not.toBeInTheDocument();
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
});
