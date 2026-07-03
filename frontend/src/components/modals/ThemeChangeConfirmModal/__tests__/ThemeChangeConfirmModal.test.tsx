import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { THEME_STORAGE_KEY } from "constants/theme";

import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ThemeChangeConfirmModal } from "components/modals/ThemeChangeConfirmModal";

import { reloadPage } from "utils/reloadPage";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("utils/reloadPage");

const MODAL_ID = "m1";
const MODAL: ActiveModal = {
    id: MODAL_ID,
    type: MODAL_TYPE.themeChange,
    nextMode: "light",
};

const renderOpen = () => {
    const store = makeTestStore({ ui: { modal: MODAL } });

    return renderWithProviders(
        <ThemeChangeConfirmModal modalId={MODAL_ID} nextMode="light" />,
        { store },
    );
};

describe("ThemeChangeConfirmModal", () => {
    it("should render the theme-change confirmation", () => {
        renderOpen();

        expect(
            screen.getByText(
                "The page will reload to apply the new theme. Make sure any unsaved changes are saved first.",
            ),
        ).toBeInTheDocument();
    });

    it("should store the next theme and reload on confirm", async () => {
        renderOpen();

        await userEvent.click(
            screen.getByRole("button", { name: "Switch theme" }),
        );

        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
        expect(jest.mocked(reloadPage)).toHaveBeenCalled();
    });

    it("should close the modal without reloading on cancel", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(store.getState().ui.modal).toBeNull();
        expect(jest.mocked(reloadPage)).not.toHaveBeenCalled();
    });
});
