import { selectActiveModal } from "redux/selectors/uiSelectors";
import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { makeTestStore } from "test/store";

const MODAL: ActiveModal = {
    id: "modal-1",
    type: MODAL_TYPE.ingredientHistory,
    ingredientId: 1,
    ingredientName: "Salt",
};

describe("uiSelectors", () => {
    it("should select the active modal", () => {
        const store = makeTestStore({ ui: { queue: [MODAL] } });

        expect(selectActiveModal(store.getState())).toEqual(MODAL);
    });

    it("should select null when no modal is open", () => {
        expect(selectActiveModal(makeTestStore().getState())).toBeNull();
    });
});
