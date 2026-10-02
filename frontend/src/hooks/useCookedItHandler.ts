import type { CookRequirement } from "types/pantryConsumption";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

interface CookedItTarget {
    recipeId?: number;
    menuId?: number;
    title: string;
    requirements: CookRequirement[];
    caloriesPerPortion: number | null;
    initialPortions?: number;
    // read off the server-rendered record (isFavourite !== null), not the client session check
    isSignedIn: boolean;
}

// shared by the recipe and menu detail pages; no handler means no button - a guest has no
// pantry, and a record without ingredients has nothing to take from it
export const useCookedItHandler = ({
    isSignedIn,
    ...target
}: CookedItTarget): (() => void) | undefined => {
    const dispatch = useAppDispatch();

    if (!isSignedIn || target.requirements.length === 0) {
        return undefined;
    }

    return () => {
        dispatch(openModal({ type: MODAL_TYPE.cookedIt, ...target }));
    };
};
