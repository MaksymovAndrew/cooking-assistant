import { render, screen } from "@testing-library/react";

import { LanguageBadge } from "components/ui/LanguageBadge";

describe("LanguageBadge", () => {
    it("should show the short code and name the language in words", () => {
        render(<LanguageBadge language="uk" />);

        expect(screen.getByText("UA")).toHaveAttribute("aria-hidden", "true");
        expect(screen.getByText("In Ukrainian")).toBeInTheDocument();
        expect(screen.getByTitle("In Ukrainian")).toBeInTheDocument();
    });
});
