import { useTranslation } from "react-i18next";

import { MAX_COOKED_PORTIONS, MIN_COOKED_PORTIONS } from "constants/cooking";
import type { CookRequirement } from "types/pantryConsumption";

import { useCookedIt } from "hooks/useCookedIt";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";
import { Stepper } from "components/ui/Stepper";
import { ToggleSwitch } from "components/ui/ToggleSwitch";

import styles from "./CookedItModal.module.scss";
import { CookedItPreviewList } from "./CookedItPreviewList";

interface CookedItModalProps {
    modalId: string;
    recipeId?: number;
    menuId?: number;
    title: string;
    requirements: CookRequirement[];
    caloriesPerPortion: number | null;
    initialPortions?: number;
}

export const CookedItModal = ({
    title,
    caloriesPerPortion,
    ...target
}: CookedItModalProps) => {
    const { t } = useTranslation("ingredients");
    const cooking = useCookedIt(target);
    const logCaloriesLabel = t("cookedItModal.logCalories");

    return (
        <BaseModal
            size="sm"
            title={t("cookedItModal.title")}
            onClose={cooking.close}
            footer={
                <>
                    <Button variant="secondary" onClick={cooking.close}>
                        {t("cookedItModal.cancel")}
                    </Button>
                    <Button
                        onClick={() => void cooking.confirm()}
                        disabled={cooking.isCooking}
                    >
                        {t("cookedItModal.confirm")}
                    </Button>
                </>
            }
        >
            <p className={styles["cooked-it-modal__title"]}>{title}</p>
            <p className={styles["cooked-it-modal__note"]}>
                {t("cookedItModal.intro")}
            </p>
            <div className={styles["cooked-it-modal__portions"]}>
                <span className={styles["cooked-it-modal__label"]}>
                    {t("cookedItModal.portions")}
                </span>
                <Stepper
                    value={cooking.portions}
                    onChange={cooking.setPortions}
                    min={MIN_COOKED_PORTIONS}
                    max={MAX_COOKED_PORTIONS}
                    decrementLabel={t("cookedItModal.fewerPortions")}
                    incrementLabel={t("cookedItModal.morePortions")}
                />
            </div>
            {caloriesPerPortion !== null && (
                <div className={styles["cooked-it-modal__calories"]}>
                    <span className={styles["cooked-it-modal__label"]}>
                        {logCaloriesLabel}
                    </span>
                    <ToggleSwitch
                        checked={cooking.logCalories}
                        onChange={cooking.setLogCalories}
                        label={logCaloriesLabel}
                    />
                </div>
            )}
            {cooking.isPantryLoading ? (
                <p className={styles["cooked-it-modal__note"]}>
                    {t("cookedItModal.loadingPantry")}
                </p>
            ) : (
                <CookedItPreviewList lines={cooking.preview} />
            )}
        </BaseModal>
    );
};
