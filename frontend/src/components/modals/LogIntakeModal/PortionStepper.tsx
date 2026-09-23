import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import styles from "./LogIntakeModal.module.scss";

export const MIN_PORTIONS = 1;

interface PortionStepperProps {
    portions: number;
    onChange: Dispatch<SetStateAction<number>>;
}

export const PortionStepper = ({ portions, onChange }: PortionStepperProps) => {
    const { t } = useTranslation("calories");

    return (
        <div className={styles["log-intake-modal__stepper"]}>
            <span className={styles["log-intake-modal__stepper-label"]}>
                {t("logIntakeModal.portionsLabel")}
            </span>
            <div className={styles["log-intake-modal__stepper-control"]}>
                <button
                    type="button"
                    aria-label={t("logIntakeModal.fewerPortions")}
                    onClick={() => {
                        onChange((count) => Math.max(MIN_PORTIONS, count - 1));
                    }}
                >
                    −
                </button>
                <span>{portions}</span>
                <button
                    type="button"
                    aria-label={t("logIntakeModal.morePortions")}
                    onClick={() => {
                        onChange((count) => count + 1);
                    }}
                >
                    +
                </button>
            </div>
        </div>
    );
};
