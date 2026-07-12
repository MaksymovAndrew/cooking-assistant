import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ThemeToggle } from "components/ui/ThemeToggle";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

const TOGGLE_BUTTON_NAME = "Toggle theme";

describe("ThemeToggle", () => {
    it("should render as an icon-only button in dark mode, with no visible label", () => {
        renderWithProviders(<ThemeToggle />, {
            store: makeTestStore({ theme: { mode: "dark" } }),
        });

        expect(
            screen.getByRole("button", { name: TOGGLE_BUTTON_NAME }),
        ).toBeInTheDocument();
        expect(screen.queryByText("Dark")).not.toBeInTheDocument();
        expect(screen.queryByText("Light")).not.toBeInTheDocument();
    });

    it("should render as an icon-only button in light mode, with no visible label", () => {
        renderWithProviders(<ThemeToggle />, {
            store: makeTestStore({ theme: { mode: "light" } }),
        });

        expect(
            screen.getByRole("button", { name: TOGGLE_BUTTON_NAME }),
        ).toBeInTheDocument();
        expect(screen.queryByText("Dark")).not.toBeInTheDocument();
        expect(screen.queryByText("Light")).not.toBeInTheDocument();
    });

    it("should open the theme-change confirmation modal with the opposite mode when clicked", async () => {
        const store = makeTestStore({ theme: { mode: "dark" } });

        renderWithProviders(<ThemeToggle />, { store });

        await userEvent.click(
            screen.getByRole("button", { name: TOGGLE_BUTTON_NAME }),
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
