import { screen } from "@testing-library/react";

import { ShareButton } from "components/ui/ShareButton";

import { renderWithRouter } from "test/router";

describe("ShareButton", () => {
    it("should render a labelled share button", () => {
        renderWithRouter(<ShareButton title="Borscht" iconSize={16} />);

        expect(screen.getByRole("button", { name: "Share" })).toBeEnabled();
    });
});
