import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { OfflineModal } from "components/connectivity/OfflineModal";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

const TITLE = "No internet connection";
const MODAL_ID = "m1";
const MODAL: ActiveModal = { id: MODAL_ID, type: MODAL_TYPE.offline };

const renderOpen = () => {
    const store = makeTestStore({ ui: { queue: [MODAL] } });

    return renderWithProviders(<OfflineModal modalId={MODAL_ID} />, { store });
};

describe("OfflineModal", () => {
    it("should show the offline message", () => {
        renderOpen();

        expect(screen.getByText(TITLE)).toBeInTheDocument();
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
});
