import { ChefHat, Flame } from "lucide-react";
import React from "react";

import type { FavouriteToggle } from "hooks/useFavouriteToggle";

import { EditMark, TrashMark } from "components/icons";
import { FavouriteButton } from "components/ui/FavouriteButton";
import { LinkButton } from "components/ui/LinkButton";
import { ShareButton } from "components/ui/ShareButton";

import { OwnerActionButton } from "./OwnerActionButton";
import styles from "./OwnerActions.module.scss";

interface OwnerActionsProps {
    editTo: string;
    onDelete: () => void;
    editLabel: string;
    deleteLabel: string;
    favourite: FavouriteToggle;
    favouriteLabel: string;
    shareTitle: string;
    onLogIntake?: () => void;
    logIntakeLabel?: string;
    onCook?: () => void;
    cookLabel?: string;
}

const ICON_SIZE = 16;

export const OwnerActions: React.FC<OwnerActionsProps> = ({
    editTo,
    onDelete,
    editLabel,
    deleteLabel,
    favourite,
    favouriteLabel,
    shareTitle,
    onLogIntake,
    logIntakeLabel = "",
    onCook,
    cookLabel = "",
}) => (
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
        {onCook && (
            <OwnerActionButton
                icon={<ChefHat size={ICON_SIZE} aria-hidden="true" />}
                label={cookLabel}
                onClick={onCook}
                className={styles["owner-actions__accent"]}
            />
        )}
        {onLogIntake && (
            <OwnerActionButton
                icon={<Flame size={ICON_SIZE} aria-hidden="true" />}
                label={logIntakeLabel}
                onClick={onLogIntake}
                className={styles["owner-actions__accent"]}
            />
        )}
        <ShareButton title={shareTitle} iconSize={ICON_SIZE} />
        <OwnerActionButton
            icon={<TrashMark size={ICON_SIZE} />}
            label={deleteLabel}
            onClick={onDelete}
            className={styles["owner-actions__delete"]}
        />
    </div>
);
