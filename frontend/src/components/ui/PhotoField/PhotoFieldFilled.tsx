import { ImageUp, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { useFileDrop } from "hooks/useFileDrop";
import { useIsHydrated } from "hooks/useIsHydrated";

import styles from "./PhotoField.module.scss";

const ACTION_ICON_SIZE = 16;

interface PhotoFieldFilledProps {
    frameClassName: string;
    src: string;
    alt: string;
    hintId: string;
    drop: ReturnType<typeof useFileDrop>;
    onBrowse: () => void;
    onRemove: () => void;
}

export const PhotoFieldFilled: React.FC<PhotoFieldFilledProps> = ({
    frameClassName,
    src,
    alt,
    hintId,
    drop,
    onBrowse,
    onRemove,
}) => {
    const { t } = useTranslation("common");
    const isHydrated = useIsHydrated();

    return (
        <div
            className={[frameClassName, styles["photo-field__filled"]].join(
                " ",
            )}
            {...drop.dropHandlers}
        >
            <img className={styles["photo-field__image"]} src={src} alt={alt} />
            <div className={styles["photo-field__overlay-actions"]}>
                <button
                    type="button"
                    className={styles["photo-field__icon-button"]}
                    aria-label={t("photo.replace")}
                    aria-describedby={hintId}
                    title={t("photo.replace")}
                    disabled={!isHydrated}
                    onClick={onBrowse}
                >
                    <ImageUp size={ACTION_ICON_SIZE} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    className={[
                        styles["photo-field__icon-button"],
                        styles["photo-field__icon-button--danger"],
                    ].join(" ")}
                    aria-label={t("photo.remove")}
                    title={t("photo.remove")}
                    disabled={!isHydrated}
                    onClick={onRemove}
                >
                    <Trash2 size={ACTION_ICON_SIZE} aria-hidden="true" />
                </button>
            </div>
            {drop.isDragging && (
                <div className={styles["photo-field__drop-overlay"]}>
                    {t("photo.dropToReplace")}
                </div>
            )}
        </div>
    );
};
