import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { NewsModal } from "components/modals/NewsModal";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

const MODAL_ID = "m1";
const MODAL: ActiveModal = { id: MODAL_ID, type: MODAL_TYPE.news };

const renderOpen = () => {
    const store = makeTestStore({ ui: { queue: [MODAL] } });

    return renderWithProviders(<NewsModal modalId={MODAL_ID} />, { store });
};

describe("NewsModal", () => {
    it("should render the title and the news items", () => {
        renderOpen();

        expect(screen.getByText("What's new")).toBeInTheDocument();
        expect(
            screen.getByText("Browse without an account"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Calorie tracking is here"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Smarter search and shareable filters"),
        ).toBeInTheDocument();
        expect(screen.getByText("Sign in your way")).toBeInTheDocument();
    });

    it("should close the modal on the close button", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should close the modal when the overlay is clicked", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("presentation"));

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should not close the modal when clicking inside the dialog", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByText("What's new"));

        expect(selectActiveModal(store.getState())).toEqual(MODAL);
    });

    it("should close the modal when Escape is pressed", async () => {
        const { store } = renderOpen();

        await userEvent.keyboard("{Escape}");

        expect(selectActiveModal(store.getState())).toBeNull();
    });
});
