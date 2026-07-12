import { render, screen } from "@testing-library/react";

import { HighlightedMatch } from "components/ui/HighlightedMatch";

describe("HighlightedMatch", () => {
    it("should wrap the matching substring in a strong tag", () => {
        render(<HighlightedMatch text="Potato" query="pot" />);

        expect(
            screen.getByText("Pot", { selector: "strong" }),
        ).toBeInTheDocument();
        expect(screen.getByText("ato")).toBeInTheDocument();
    });

    it("should render the plain text when there is no match", () => {
        render(<HighlightedMatch text="Potato" query="zzz" />);

        expect(
            screen.queryByText("", { selector: "strong" }),
        ).not.toBeInTheDocument();
        expect(screen.getByText("Potato")).toBeInTheDocument();
    });
});
