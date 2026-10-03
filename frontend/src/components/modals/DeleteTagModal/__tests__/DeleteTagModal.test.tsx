import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { DeleteTagModal } from "components/modals/DeleteTagModal";

import { makeAxiosError, mockedDelete } from "test/apiClientMock";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const TAG_ID = 3;
const TAG_NAME = "Weeknight";
const MODAL_ID = "m1";
const MODAL: ActiveModal = {
    id: MODAL_ID,
    type: MODAL_TYPE.deleteTag,
    tagId: TAG_ID,
    tagName: TAG_NAME,
};

const renderOpen = () =>
    renderWithProviders(
        <DeleteTagModal modalId={MODAL_ID} tagId={TAG_ID} tagName={TAG_NAME} />,
        { store: makeTestStore({ ui: { queue: [MODAL] } }) },
    );

const clickConfirm = () =>
    userEvent.click(screen.getByRole("button", { name: "Delete" }));

describe("DeleteTagModal", () => {
    it("should delete the tag and close on confirm", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const { store } = renderOpen();

        await clickConfirm();

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.tags.byId(TAG_ID),
            { params: undefined },
        );
        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should keep the modal open when deletion fails", async () => {
        mockedDelete.mockRejectedValue(makeAxiosError(500, "Boom"));
        const { store } = renderOpen();

        await clickConfirm();

        expect(selectActiveModal(store.getState())).toEqual(MODAL);
    });
});
