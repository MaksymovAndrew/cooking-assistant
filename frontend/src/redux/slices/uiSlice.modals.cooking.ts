import type { CookRequirement } from "types/pantryConsumption";

import type { MODAL_TYPE } from "./uiSlice.modals";

export interface CookedItModalInput {
    type: typeof MODAL_TYPE.cookedIt;
    recipeId?: number;
    menuId?: number;
    title: string;
    requirements: CookRequirement[];
    // null hides the "log the calories" option - the server refuses it without calorie data
    caloriesPerPortion: number | null;
    initialPortions?: number;
}
