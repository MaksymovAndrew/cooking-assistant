import React from "react";

import { EditMark, TrashMark } from "components/icons";
import { LinkButton } from "components/ui/LinkButton";

import styles from "./OwnerActions.module.scss";

interface OwnerActionsProps {
    editTo: string;
    onDelete: () => void;
    editLabel: string;
    deleteLabel: string;
}

const ICON_SIZE = 16;

export const OwnerActions: React.FC<OwnerActionsProps> = ({
    editTo,
    onDelete,
    editLabel,
    deleteLabel,
}) => (
    <div className={styles["owner-actions"]}>
        <LinkButton to={editTo}>
            <EditMark size={ICON_SIZE} />
            {editLabel}
        </LinkButton>
        <button
            type="button"
            onClick={onDelete}
            aria-label={deleteLabel}
            className={styles["owner-actions__delete"]}
        >
            <TrashMark size={ICON_SIZE} />
            {deleteLabel}
        </button>
    </div>
);
