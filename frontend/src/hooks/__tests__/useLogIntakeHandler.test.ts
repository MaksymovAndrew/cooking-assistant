import { selectActiveModal } from "redux/selectors/uiSelectors";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { useLogIntakeHandler } from "hooks/useLogIntakeHandler";

import { renderHookWithStore } from "test/store";

describe("useLogIntakeHandler", () => {
    it("should open the log-intake modal with everything it needs", () => {
        const { result, store } = renderHookWithStore(() =>
            useLogIntakeHandler({
                menuId: 9,
                title: "Week of soups",
                caloriesPerPortion: 540,
                initialPortions: 3,
            }),
        );

        result.current?.();

        expect(selectActiveModal(store.getState())).toEqual(
            expect.objectContaining({
                type: MODAL_TYPE.logIntake,
                menuId: 9,
                title: "Week of soups",
                caloriesPerPortion: 540,
                initialPortions: 3,
            }),
        );
    });

    it("should offer no button for a record without calorie data", () => {
        const { result } = renderHookWithStore(() =>
            useLogIntakeHandler({
                recipeId: 5,
                title: "Pancakes",
                caloriesPerPortion: null,
            }),
        );

        expect(result.current).toBeUndefined();
    });
});
