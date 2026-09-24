import { ImagePlus } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { useFileDrop } from "hooks/useFileDrop";
import { useIsHydrated } from "hooks/useIsHydrated";

import styles from "./PhotoField.module.scss";

const PLACEHOLDER_ICON_SIZE = 28;

interface PhotoFieldEmptyProps {
    buttonRef: React.Ref<HTMLButtonElement>;
    frameClassName: string;
    hintId: string;
    drop: ReturnType<typeof useFileDrop>;
    onBrowse: () => void;
}

// the whole frame is one button: a click opens the file picker, a dropped file lands on it
export const PhotoFieldEmpty: React.FC<PhotoFieldEmptyProps> = ({
    buttonRef,
    frameClassName,
    hintId,
    drop,
    onBrowse,
}) => {
    const { t } = useTranslation("common");
    const isHydrated = useIsHydrated();

    return (
        <button
            ref={buttonRef}
            type="button"
            className={[
                frameClassName,
                styles["photo-field__dropzone"],
                drop.isDragging && styles["photo-field__dropzone--active"],
            ]
                .filter(Boolean)
                .join(" ")}
            aria-describedby={hintId}
            disabled={!isHydrated}
            onClick={onBrowse}
            {...drop.dropHandlers}
        >
            <ImagePlus
                className={styles["photo-field__placeholder"]}
                size={PLACEHOLDER_ICON_SIZE}
                aria-hidden="true"
            />
            {drop.isDragging ? (
                <span className={styles["photo-field__prompt"]}>
                    {t("photo.dropToAdd")}
                </span>
            ) : (
                <>
                    <span className={styles["photo-field__prompt"]}>
                        {t("photo.choose")}
                    </span>
                    <span className={styles["photo-field__drag-hint"]}>
                        {t("photo.dragHint")}
                    </span>
                </>
            )}
        </button>
    );
};
