import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ThemeToggle } from "components/ui/ThemeToggle";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

const TOGGLE_BUTTON_NAME = "Toggle theme";

describe("ThemeToggle", () => {
    it("should open the theme-change confirmation modal with the opposite mode when clicked", async () => {
        const store = makeTestStore({ theme: { mode: "dark" } });

        renderWithProviders(<ThemeToggle />, { store });

        await userEvent.click(
            screen.getByRole("button", { name: TOGGLE_BUTTON_NAME }),
        );

        expect(selectActiveModal(store.getState())).toMatchObject({
            type: MODAL_TYPE.themeChange,
            nextMode: "light",
        });
        // only the confirm modal switches the theme, since a switch reloads the page
        expect(store.getState().theme.mode).toBe("dark");
    });
});
