import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

interface LogIntakeTarget {
    recipeId?: number;
    menuId?: number;
    title: string;
    caloriesPerPortion: number | null;
}

// shared by the recipe and menu detail pages - a null caloriesPerPortion (nothing
// loaded yet, or nothing to log) means the trigger button stays hidden
export const useLogIntakeHandler = (
    target: LogIntakeTarget,
): (() => void) | undefined => {
    const dispatch = useAppDispatch();

    if (target.caloriesPerPortion === null) {
        return undefined;
    }

    const { recipeId, menuId, title, caloriesPerPortion } = target;

    return () => {
        dispatch(
            openModal({
                type: MODAL_TYPE.logIntake,
                recipeId,
                menuId,
                title,
                caloriesPerPortion,
            }),
        );
    };
};
