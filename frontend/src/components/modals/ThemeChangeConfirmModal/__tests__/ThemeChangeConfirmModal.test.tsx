import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { THEME_STORAGE_KEY } from "constants/theme";

import { selectActiveModal } from "redux/selectors/uiSelectors";
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
    const store = makeTestStore({ ui: { queue: [MODAL] } });

    return renderWithProviders(
        <ThemeChangeConfirmModal modalId={MODAL_ID} nextMode="light" />,
        { store },
    );
};

describe("ThemeChangeConfirmModal", () => {
    it("should render the theme-change confirmation", () => {
        renderOpen();

        expect(screen.getByText("Switch to light theme?")).toBeInTheDocument();
        expect(
            screen.getByText(
                "The app will reload to apply the new appearance. Your place in the app is preserved.",
            ),
        ).toBeInTheDocument();
    });

    it("should store the next theme and reload on confirm", async () => {
        renderOpen();

        await userEvent.click(
            screen.getByRole("button", { name: "Switch & reload" }),
        );

        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
        expect(jest.mocked(reloadPage)).toHaveBeenCalled();
    });

    it("should close the modal without reloading on cancel", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(selectActiveModal(store.getState())).toBeNull();
        expect(jest.mocked(reloadPage)).not.toHaveBeenCalled();
    });
});
