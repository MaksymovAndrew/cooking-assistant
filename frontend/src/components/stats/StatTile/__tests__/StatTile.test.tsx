import { render, screen } from "@testing-library/react";

import { StatTile } from "components/stats/StatTile";

describe("StatTile", () => {
    it("should render the label and value", () => {
        render(<StatTile label="Total recipes" value={24} />);

        expect(screen.getByText("Total recipes")).toBeInTheDocument();
        expect(screen.getByText("24")).toBeInTheDocument();
    });

    it("should render the caption when provided", () => {
        render(
            <StatTile
                label="Most used type"
                value="Soup"
                caption="9 of 24 recipes"
            />,
        );

        expect(screen.getByText("9 of 24 recipes")).toBeInTheDocument();
    });

    it("should not render a caption element when none is provided", () => {
        render(<StatTile label="Total recipes" value={24} />);

        expect(screen.queryByText(/of \d+/)).not.toBeInTheDocument();
    });
});
