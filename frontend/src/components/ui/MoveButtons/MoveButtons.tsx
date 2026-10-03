import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { MoveDirection } from "types/reorder";

import { useKeepMoveFocus } from "hooks/useKeepMoveFocus";

import { cx } from "utils/cx";

import styles from "./MoveButtons.module.scss";

interface MoveButtonsProps {
    // the item's own name, so each button says which row it moves
    name: string;
    isFirst: boolean;
    isLast: boolean;
    onMove: (direction: MoveDirection) => void;
    buttonClassName?: string;
}

const MOVE_ICON_SIZE = 13;
const ICON_STROKE = 2.2;

// the keyboard and touch way to reorder a list that is also draggable
export const MoveButtons: React.FC<MoveButtonsProps> = ({
    name,
    isFirst,
    isLast,
    onMove,
    buttonClassName,
}) => {
    const { t } = useTranslation();
    const { upRef, downRef, remember } = useKeepMoveFocus();
    const className = cx(styles["move-buttons__button"], buttonClassName);

    const move = (direction: MoveDirection) => {
        remember(direction);
        onMove(direction);
    };

    return (
        <div className={styles["move-buttons"]}>
            <button
                ref={upRef}
                type="button"
                aria-label={t("moveButtons.up", { name })}
                disabled={isFirst}
                className={className}
                onClick={() => {
                    move(-1);
                }}
            >
                <ChevronUp
                    size={MOVE_ICON_SIZE}
                    strokeWidth={ICON_STROKE}
                    aria-hidden="true"
                />
            </button>
            <button
                ref={downRef}
                type="button"
                aria-label={t("moveButtons.down", { name })}
                disabled={isLast}
                className={className}
                onClick={() => {
                    move(1);
                }}
            >
                <ChevronDown
                    size={MOVE_ICON_SIZE}
                    strokeWidth={ICON_STROKE}
                    aria-hidden="true"
                />
            </button>
        </div>
    );
};
