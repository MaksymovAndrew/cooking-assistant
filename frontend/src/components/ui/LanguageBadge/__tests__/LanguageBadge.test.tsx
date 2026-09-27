import { render, screen } from "@testing-library/react";

import { LanguageBadge } from "components/ui/LanguageBadge";

describe("LanguageBadge", () => {
    it("should show the short code and name the language in words", () => {
        render(<LanguageBadge language="uk" />);

        expect(screen.getByText("UA")).toHaveAttribute("aria-hidden", "true");
        expect(screen.getByText("In Ukrainian")).toBeInTheDocument();
        expect(screen.getByTitle("In Ukrainian")).toBeInTheDocument();
    });

    it("should default to the plain tone", () => {
        render(<LanguageBadge language="pl" />);

        expect(screen.getByTitle("In Polish")).toHaveClass(
            "language-badge--plain",
        );
    });

    it("should apply the overlay tone when asked", () => {
        render(<LanguageBadge language="ru" tone="overlay" />);

        expect(screen.getByTitle("In Russian")).toHaveClass(
            "language-badge--overlay",
        );
    });
});
