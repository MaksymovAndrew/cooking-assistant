import { screen } from "@testing-library/react";

import { RatingSummary } from "components/ui/RatingSummary";

import { renderWithRouter } from "test/router";

const ICON_SIZE = 12;
const CLASS_NAME = "summary";

describe("RatingSummary", () => {
    it("should print the average to one decimal with the vote count", () => {
        renderWithRouter(
            <RatingSummary
                average={4}
                count={7}
                iconSize={ICON_SIZE}
                className={CLASS_NAME}
            />,
        );

        expect(screen.getByText("4.0")).toBeInTheDocument();
        expect(screen.getByText("(7)")).toBeInTheDocument();
        expect(
            screen.getByText("Rated 4.0 out of 5 from 7 ratings"),
        ).toBeInTheDocument();
    });

    it("should leave the count out when asked", () => {
        renderWithRouter(
            <RatingSummary
                average={4.46}
                count={7}
                iconSize={ICON_SIZE}
                className={CLASS_NAME}
                showCount={false}
            />,
        );

        expect(screen.getByText("4.5")).toBeInTheDocument();
        expect(screen.queryByText("(7)")).not.toBeInTheDocument();
    });

    it("should say there are no ratings yet for an unrated record", () => {
        renderWithRouter(
            <RatingSummary
                average={null}
                count={0}
                iconSize={ICON_SIZE}
                className={CLASS_NAME}
            />,
        );

        expect(screen.getByText("No ratings yet")).toBeInTheDocument();
    });

    it("should render nothing for an unrated record when a card has no room", () => {
        const { container } = renderWithRouter(
            <RatingSummary
                average={null}
                count={0}
                iconSize={ICON_SIZE}
                className={CLASS_NAME}
                hideWhenEmpty
            />,
        );

        expect(container).toBeEmptyDOMElement();
    });
});
