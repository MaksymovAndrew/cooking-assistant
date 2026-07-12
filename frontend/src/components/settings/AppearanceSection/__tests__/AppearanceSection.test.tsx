import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { THEME_STORAGE_KEY } from "constants/theme";

import { MODAL_TYPE } from "redux/slices/uiSlice";

import { AppearanceSection } from "components/settings/AppearanceSection";

import { renderWithProviders } from "test/router";

describe("AppearanceSection", () => {
    it("should mark System as active when no theme is stored", () => {
        renderWithProviders(<AppearanceSection />);

        expect(screen.getByRole("radio", { name: "System" })).toHaveAttribute(
            "aria-checked",
            "true",
        );
    });

    it("should open the theme-change confirmation when a different theme is selected", async () => {
        const { store } = renderWithProviders(<AppearanceSection />);

        await userEvent.click(screen.getByRole("radio", { name: "Light" }));

        expect(store.getState().ui.modal?.type).toBe(MODAL_TYPE.themeChange);
    });

    it("should not open a confirmation when the current choice is re-selected", async () => {
        localStorage.setItem(THEME_STORAGE_KEY, "dark");

        const { store } = renderWithProviders(<AppearanceSection />);

        await userEvent.click(screen.getByRole("radio", { name: "Dark" }));

        expect(store.getState().ui.modal).toBeNull();
    });

    it("should not open a confirmation when System is re-selected while already following the system theme", async () => {
        const { store } = renderWithProviders(<AppearanceSection />);

        await userEvent.click(screen.getByRole("radio", { name: "System" }));

        expect(store.getState().ui.modal).toBeNull();
    });
});
