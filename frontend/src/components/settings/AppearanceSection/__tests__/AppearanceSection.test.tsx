import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MODAL_TYPE } from "redux/slices/uiSlice";

import { AppearanceSection } from "components/settings/AppearanceSection";

import { renderWithProviders } from "test/router";

describe("AppearanceSection", () => {
    it("should open the theme-change confirmation when a different theme is selected", async () => {
        const { store } = renderWithProviders(<AppearanceSection />);

        await userEvent.click(screen.getByRole("radio", { name: "Light" }));

        expect(store.getState().ui.modal?.type).toBe(MODAL_TYPE.themeChange);
    });

    it("should not open a confirmation when the current theme is re-selected", async () => {
        const { store } = renderWithProviders(<AppearanceSection />);

        const currentMode = store.getState().theme.mode;
        const sameLabel = currentMode === "dark" ? "Dark" : "Light";

        await userEvent.click(screen.getByRole("radio", { name: sameLabel }));

        expect(store.getState().ui.modal).toBeNull();
    });
});
