import { render, screen } from "@testing-library/react";
import { Globe } from "lucide-react";

import { SettingsRow } from "components/settings/SettingsRow";

describe("SettingsRow", () => {
    it("should render the title, description and control", () => {
        render(
            <SettingsRow
                icon={Globe}
                title="Language"
                description="English only for now."
            >
                <span>EN</span>
            </SettingsRow>,
        );

        expect(screen.getByText("Language")).toBeInTheDocument();
        expect(screen.getByText("English only for now.")).toBeInTheDocument();
        expect(screen.getByText("EN")).toBeInTheDocument();
    });

    it("should apply the danger modifier class to the title when danger is set", () => {
        render(
            <SettingsRow
                icon={Globe}
                title="Delete account"
                description="Removes all your data."
                danger
            >
                <button type="button">Delete</button>
            </SettingsRow>,
        );

        expect(screen.getByText("Delete account")).toHaveClass(
            "settings-row__title--danger",
        );
    });

    it("should show a coming-soon badge when comingSoon is set", () => {
        render(
            <SettingsRow
                icon={Globe}
                title="Language"
                description="English only for now."
                disabled
                comingSoon
            >
                <span>EN</span>
            </SettingsRow>,
        );

        expect(screen.getByText("Coming soon")).toBeInTheDocument();
    });

    it("should not show a coming-soon badge by default", () => {
        render(
            <SettingsRow
                icon={Globe}
                title="Language"
                description="English only for now."
            >
                <span>EN</span>
            </SettingsRow>,
        );

        expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
    });
});
