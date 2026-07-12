import { render, screen } from "@testing-library/react";

import { LanguageSection } from "components/settings/LanguageSection";

describe("LanguageSection", () => {
    it("should render the language and units rows, both disabled", () => {
        render(<LanguageSection />);

        expect(screen.getByText("Language")).toBeInTheDocument();
        expect(screen.getByText("EN")).toBeInTheDocument();
        expect(screen.getByText("Units")).toBeInTheDocument();
        expect(
            screen.getByRole("radio", { name: "Metric" }),
        ).toBeInTheDocument();
    });
});
