import { render, screen } from "@testing-library/react";

import { SettingsSection } from "components/settings/SettingsSection";

describe("SettingsSection", () => {
    it("should render the heading and its children", () => {
        render(
            <SettingsSection heading="Appearance">
                <p>Theme row</p>
            </SettingsSection>,
        );

        expect(screen.getByText("Appearance")).toBeInTheDocument();
        expect(screen.getByText("Theme row")).toBeInTheDocument();
    });
});
