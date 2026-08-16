import React from "react";
import { useTranslation } from "react-i18next";

import { CLICK_OUTSIDE_SAFE_ATTR } from "hooks/useClickOutside";

import { Button } from "components/ui/Button";

interface AddIngredientModalFooterProps {
    step: "pick" | "quantities";
    canContinue: boolean;
    isLastQuantityStep: boolean;
    onCancel: () => void;
    onContinue: () => void;
    onBack: () => void;
    onNext: () => void;
}

export const AddIngredientModalFooter: React.FC<
    AddIngredientModalFooterProps
> = ({
    step,
    canContinue,
    isLastQuantityStep,
    onCancel,
    onContinue,
    onBack,
    onNext,
}) => {
    const { t } = useTranslation("ingredients");

    if (step === "pick") {
        return (
            <>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    {...{ [CLICK_OUTSIDE_SAFE_ATTR]: "" }}
                >
                    {t("addIngredientModal.cancelButton")}
                </Button>
                <Button
                    type="button"
                    disabled={!canContinue}
                    onClick={onContinue}
                    {...{ [CLICK_OUTSIDE_SAFE_ATTR]: "" }}
                >
                    {t("addIngredientModal.continueButton")}
                </Button>
            </>
        );
    }

    return (
        <>
            <Button type="button" variant="secondary" onClick={onBack}>
                {t("addIngredientModal.backButton")}
            </Button>
            <Button type="button" onClick={onNext}>
                {isLastQuantityStep
                    ? t("addIngredientModal.saveButton")
                    : t("addIngredientModal.nextButton")}
            </Button>
        </>
    );
};
