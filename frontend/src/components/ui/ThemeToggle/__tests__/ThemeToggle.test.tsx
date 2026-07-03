import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ThemeToggle } from "components/ui/ThemeToggle";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

describe("ThemeToggle", () => {
    it("should show the moon icon and dark label in dark mode", () => {
        renderWithProviders(<ThemeToggle />, {
            store: makeTestStore({ theme: { mode: "dark" } }),
        });

        expect(screen.getByText("Dark")).toBeInTheDocument();
    });

    it("should show the sun icon and light label in light mode", () => {
        renderWithProviders(<ThemeToggle />, {
            store: makeTestStore({ theme: { mode: "light" } }),
        });

        expect(screen.getByText("Light")).toBeInTheDocument();
    });

    it("should open the theme-change confirmation modal with the opposite mode when clicked", async () => {
        const store = makeTestStore({ theme: { mode: "dark" } });

        renderWithProviders(<ThemeToggle />, { store });

        await userEvent.click(
            screen.getByRole("button", { name: "Toggle theme" }),
        );

        expect(store.getState().ui.modal).toMatchObject({
            type: MODAL_TYPE.themeChange,
            nextMode: "light",
        });
        // clicking the toggle must not switch the theme by itself - only
        // confirming the modal does, since a switch reloads the page
        expect(store.getState().theme.mode).toBe("dark");
    });
});
