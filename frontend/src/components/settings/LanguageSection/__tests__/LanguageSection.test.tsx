import { screen } from "@testing-library/react";

import { LanguageSection } from "components/settings/LanguageSection";

import { renderWithRouter } from "test/router";

describe("LanguageSection", () => {
    it("should offer the language switcher", () => {
        renderWithRouter(<LanguageSection />);

        expect(screen.getByText("Interface language")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Language: English" }),
        ).toBeInTheDocument();
    });
});
