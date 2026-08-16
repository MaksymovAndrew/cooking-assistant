import { render, screen } from "@testing-library/react";

import { NotificationsSection } from "components/settings/NotificationsSection";

describe("NotificationsSection", () => {
    it("should render both notification rows as disabled toggles", () => {
        render(<NotificationsSection />);

        expect(
            screen.getByRole("switch", { name: "Expiry reminders" }),
        ).toBeDisabled();
        expect(
            screen.getByRole("switch", { name: "Weekly digest" }),
        ).toBeDisabled();
    });

    it("should mark both rows as coming soon", () => {
        render(<NotificationsSection />);

        expect(screen.getAllByText("Coming soon")).toHaveLength(2);
    });
});
