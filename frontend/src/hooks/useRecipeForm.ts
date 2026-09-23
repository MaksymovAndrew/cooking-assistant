import { useCallback, useState } from "react";

import type { RecipeFormInitialValues } from "types/recipeForm";

import { useDirtyRef } from "hooks/useDirtyRef";
import { useRecipeFormValidators } from "hooks/useRecipeFormValidators";
import { useRecordPhotoDraft } from "hooks/useRecordPhotoDraft";
import { useSelectedIngredients } from "hooks/useSelectedIngredients";

const BLANK_SNAPSHOT: RecipeFormInitialValues = {
    title: "",
    content: "",
    cookingHours: "",
    cookingMinutes: "",
    selectedTypeId: null,
    selectedIngredients: [],
    caloriesOverride: "",
    photoKey: null,
};

export const useRecipeForm = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [cookingHours, setCookingHours] = useState("");
    const [cookingMinutes, setCookingMinutes] = useState("");
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [caloriesOverride, setCaloriesOverride] = useState("");
    const [initialSnapshot, setInitialSnapshot] =
        useState<RecipeFormInitialValues>(BLANK_SNAPSHOT);
    const photo = useRecordPhotoDraft("recipe");
    const { reset: resetPhoto } = photo;

    const { setSelectedIngredients, ...ingredients } = useSelectedIngredients();
    const { selectedIngredients } = ingredients;

    const validation = useRecipeFormValidators({
        title,
        content,
        selectedIngredients,
        selectedTypeId,
        cookingHours,
        cookingMinutes,
    });

    const setInitialValues = useCallback(
        (values: RecipeFormInitialValues) => {
            setTitle(values.title);
            setContent(values.content);
            setCookingHours(values.cookingHours);
            setCookingMinutes(values.cookingMinutes);
            setSelectedTypeId(values.selectedTypeId);
            setSelectedIngredients(values.selectedIngredients);
            setCaloriesOverride(values.caloriesOverride);
            resetPhoto(values.photoKey);
            setInitialSnapshot(values);
        },
        [setSelectedIngredients, resetPhoto],
    );

    // the photo keeps its own dirty state: a picked file is not a value that serializes
    const current: RecipeFormInitialValues = {
        title,
        content,
        cookingHours,
        cookingMinutes,
        selectedTypeId,
        selectedIngredients,
        caloriesOverride,
        photoKey: initialSnapshot.photoKey,
    };
    const isDirty =
        photo.isDirty ||
        JSON.stringify(current) !== JSON.stringify(initialSnapshot);

    const { isDirtyRef, markClean } = useDirtyRef(isDirty);

    return {
        title,
        setTitle,
        content,
        setContent,
        cookingHours,
        setCookingHours,
        cookingMinutes,
        setCookingMinutes,
        selectedTypeId,
        setSelectedTypeId,
        caloriesOverride,
        setCaloriesOverride,
        photo,
        ...ingredients,
        ...validation,
        setInitialValues,
        isDirty,
        isDirtyRef,
        markClean,
    };
};
