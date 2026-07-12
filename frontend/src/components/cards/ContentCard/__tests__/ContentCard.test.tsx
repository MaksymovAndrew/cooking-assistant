import { screen } from "@testing-library/react";
import { Calendar, Clock, UtensilsCrossed } from "lucide-react";

import { ContentCard } from "components/cards/ContentCard";

import { renderWithRouter } from "test/router";

const COOKING_TIME_LABEL = "1 hr : 25 min";

const renderCard = (
    props: Partial<React.ComponentProps<typeof ContentCard>> = {},
) =>
    renderWithRouter(
        <ContentCard
            to="/recipe/1"
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

        expect(screen.getByRole("link")).toHaveClass("content-card--mine");
    });

    it("should apply the badge class when badge is true", () => {
        renderCard({ badge: true });

        expect(screen.getByRole("link")).toHaveClass("content-card--badge");
    });

    it("should default to the grid variant", () => {
        renderCard();

        expect(screen.getByRole("link")).toHaveClass("content-card--grid");
    });

    it("should render the row variant when requested", () => {
        renderCard({ variant: "row" });

        expect(screen.getByRole("link")).toHaveClass("content-card--row");
    });

    it("should disable the favourite button since favourites are not wired up yet", () => {
        renderCard();

        expect(
            screen.getByRole("button", { name: "Favourite" }),
        ).toBeDisabled();
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
