import { Flame } from "lucide-react";
import React from "react";

import type { FavouriteToggle } from "hooks/useFavouriteToggle";
import { useIsHydrated } from "hooks/useIsHydrated";

import { EditMark, TrashMark } from "components/icons";
import { FavouriteButton } from "components/ui/FavouriteButton";
import { LinkButton } from "components/ui/LinkButton";

import styles from "./OwnerActions.module.scss";

interface OwnerActionsProps {
    editTo: string;
    onDelete: () => void;
    editLabel: string;
    deleteLabel: string;
    favourite: FavouriteToggle;
    favouriteLabel: string;
    onLogIntake?: () => void;
    logIntakeLabel?: string;
}

const ICON_SIZE = 16;

export const OwnerActions: React.FC<OwnerActionsProps> = ({
    editTo,
    onDelete,
    editLabel,
    deleteLabel,
    favourite,
    favouriteLabel,
    onLogIntake,
    logIntakeLabel,
}) => {
    // these buttons are on screen from the server render; until React hydrates their handlers
    // do not exist, so a press would be silently swallowed
    const isHydrated = useIsHydrated();

    return (
        <div className={styles["owner-actions"]}>
            <LinkButton href={editTo} className={styles["owner-actions__edit"]}>
                <EditMark size={ICON_SIZE} />
                {editLabel}
            </LinkButton>
            <FavouriteButton
                favourite={favourite}
                label={favouriteLabel}
                iconSize={ICON_SIZE}
                className={styles["owner-actions__favourite"]}
            >
                <span className={styles["owner-actions__label"]}>
                    {favouriteLabel}
                </span>
            </FavouriteButton>
            {onLogIntake && (
                <button
                    type="button"
                    onClick={onLogIntake}
                    disabled={!isHydrated}
                    aria-label={logIntakeLabel}
                    className={styles["owner-actions__log-intake"]}
                >
                    <Flame size={ICON_SIZE} aria-hidden="true" />
                    <span className={styles["owner-actions__label"]}>
                        {logIntakeLabel}
                    </span>
                </button>
            )}
            <button
                type="button"
                onClick={onDelete}
                disabled={!isHydrated}
                aria-label={deleteLabel}
                className={styles["owner-actions__delete"]}
            >
                <TrashMark size={ICON_SIZE} />
                <span className={styles["owner-actions__label"]}>
                    {deleteLabel}
                </span>
            </button>
        </div>
    );
};
