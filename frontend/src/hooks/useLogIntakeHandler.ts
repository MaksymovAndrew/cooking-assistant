import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

interface LogIntakeTarget {
    recipeId?: number;
    menuId?: number;
    title: string;
    caloriesPerPortion: number | null;
    initialPortions?: number;
}

// shared by the recipe and menu detail pages - a null caloriesPerPortion hides the trigger button
export const useLogIntakeHandler = (
    target: LogIntakeTarget,
): (() => void) | undefined => {
    const dispatch = useAppDispatch();

    if (target.caloriesPerPortion === null) {
        return undefined;
    }

    const { recipeId, menuId, title, caloriesPerPortion, initialPortions } =
        target;

    return () => {
        dispatch(
            openModal({
                type: MODAL_TYPE.logIntake,
                recipeId,
                menuId,
                title,
                caloriesPerPortion,
                initialPortions,
            }),
        );
    };
};
