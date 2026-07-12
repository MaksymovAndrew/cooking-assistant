import { Heart } from "lucide-react";
import React from "react";

import { EditMark, TrashMark } from "components/icons";
import { LinkButton } from "components/ui/LinkButton";

import styles from "./OwnerActions.module.scss";

interface OwnerActionsProps {
    editTo: string;
    onDelete: () => void;
    editLabel: string;
    deleteLabel: string;
    favouriteLabel: string;
}

const ICON_SIZE = 16;

export const OwnerActions: React.FC<OwnerActionsProps> = ({
    editTo,
    onDelete,
    editLabel,
    deleteLabel,
    favouriteLabel,
}) => (
    <div className={styles["owner-actions"]}>
        <LinkButton to={editTo} className={styles["owner-actions__edit"]}>
            <EditMark size={ICON_SIZE} />
            {editLabel}
        </LinkButton>
        <button
            type="button"
            disabled
            aria-label={favouriteLabel}
            className={styles["owner-actions__favourite"]}
        >
            <Heart size={ICON_SIZE} aria-hidden="true" />
            <span className={styles["owner-actions__label"]}>
                {favouriteLabel}
            </span>
        </button>
        <button
            type="button"
            onClick={onDelete}
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
