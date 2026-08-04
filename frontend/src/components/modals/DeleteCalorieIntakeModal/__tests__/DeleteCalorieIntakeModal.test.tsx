import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { DeleteCalorieIntakeModal } from "components/modals/DeleteCalorieIntakeModal";

import { mockedDelete } from "test/apiClientMock";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const MODAL_ID = "m1";
const MODAL: ActiveModal = {
    id: MODAL_ID,
    type: MODAL_TYPE.deleteCalorieIntake,
    intakeId: 9,
    title: "Miso ramen",
};

const renderOpen = () => {
    const store = makeTestStore({ ui: { modal: MODAL } });
    const view = renderWithProviders(
        <DeleteCalorieIntakeModal
            modalId={MODAL_ID}
            intakeId={9}
            title="Miso ramen"
        />,
        { store },
    );

    return view;
};

const clickConfirm = () =>
    userEvent.click(screen.getByRole("button", { name: "Delete" }));

describe("DeleteCalorieIntakeModal", () => {
    it("should render the delete confirmation with the entry title", () => {
        renderOpen();

        expect(screen.getByText("Delete entry")).toBeInTheDocument();
        expect(
            screen.getByText('Are you sure you want to delete "Miso ramen"?'),
        ).toBeInTheDocument();
    });

    it("should delete the entry, notify and close on confirm", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const { store } = renderOpen();

        await clickConfirm();

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.calories.intakeById(9),
            { params: undefined },
        );
        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({
                type: "success",
                message: "Entry deleted",
            }),
        ]);
        expect(store.getState().ui.modal).toBeNull();
    });

    it("should close the modal without deleting on cancel", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(mockedDelete).not.toHaveBeenCalled();
        expect(store.getState().ui.modal).toBeNull();
    });

    it("should keep the modal open when deletion fails", async () => {
        mockedDelete.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500, data: { error: "Boom" } },
            message: "Request failed",
        });
        const { store } = renderOpen();

        await clickConfirm();

        expect(store.getState().ui.modal).toEqual(MODAL);
        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({ type: "error", message: "Boom" }),
        ]);
    });
});
