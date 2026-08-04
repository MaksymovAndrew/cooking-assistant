import { Flame, Heart } from "lucide-react";
import React from "react";

import { EditMark, TrashMark } from "components/icons";
import { LinkButton } from "components/ui/LinkButton";

import styles from "./MenuHeroActions.module.scss";

interface MenuHeroActionsProps {
    editTo: string;
    onDelete: () => void;
    editLabel: string;
    deleteLabel: string;
    favouriteLabel: string;
    onLogIntake?: () => void;
    logIntakeLabel?: string;
}

const ICON_SIZE = 16;

export const MenuHeroActions: React.FC<MenuHeroActionsProps> = ({
    editTo,
    onDelete,
    editLabel,
    deleteLabel,
    favouriteLabel,
    onLogIntake,
    logIntakeLabel,
}) => (
    <div className={styles["menu-hero-actions"]}>
        <LinkButton to={editTo} className={styles["menu-hero-actions__edit"]}>
            <EditMark size={ICON_SIZE} />
            {editLabel}
        </LinkButton>
        <button
            type="button"
            disabled
            aria-label={favouriteLabel}
            className={styles["menu-hero-actions__favourite"]}
        >
            <Heart size={ICON_SIZE} aria-hidden="true" />
            {favouriteLabel}
        </button>
        {onLogIntake && (
            <button
                type="button"
                onClick={onLogIntake}
                aria-label={logIntakeLabel}
                className={styles["menu-hero-actions__log-intake"]}
            >
                <Flame size={ICON_SIZE} aria-hidden="true" />
                {logIntakeLabel}
            </button>
        )}
        <button
            type="button"
            onClick={onDelete}
            aria-label={deleteLabel}
            className={styles["menu-hero-actions__delete"]}
        >
            <TrashMark size={ICON_SIZE} />
        </button>
    </div>
);
