import React, { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";

import { ACCEPTED_IMAGE_TYPES } from "constants/media";

import { useFileDrop } from "hooks/useFileDrop";

import styles from "./PhotoField.module.scss";
import { PhotoFieldEmpty } from "./PhotoFieldEmpty";
import { PhotoFieldFilled } from "./PhotoFieldFilled";

interface PhotoFieldProps {
    src: string | null;
    alt: string;
    error: string | null;
    onChoose: (file: File) => void;
    onRemove: () => void;
    // an avatar previews as the round tile it is shown in
    shape?: "cover" | "round";
}

export const PhotoField: React.FC<PhotoFieldProps> = ({
    src,
    alt,
    error,
    onChoose,
    onRemove,
    shape = "cover",
}) => {
    const { t } = useTranslation("common");
    const inputRef = useRef<HTMLInputElement>(null);
    const dropzoneRef = useRef<HTMLButtonElement>(null);
    const removedRef = useRef(false);
    const hintId = useId();
    const drop = useFileDrop(onChoose);

    // the remove button unmounts with the photo, so focus moves to the frame that replaces it
    useEffect(() => {
        if (!src && removedRef.current) {
            removedRef.current = false;
            dropzoneRef.current?.focus();
        }
    }, [src]);

    const remove = () => {
        removedRef.current = true;
        onRemove();
    };
    const frameClassName = [
        styles["photo-field__frame"],
        shape === "round" && styles["photo-field__frame--round"],
    ]
        .filter(Boolean)
        .join(" ");

    const browse = () => inputRef.current?.click();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.item(0);

        // cleared so picking the same file again after removing it still fires a change
        event.target.value = "";

        if (file) {
            onChoose(file);
        }
    };

    return (
        <div className={styles["photo-field"]}>
            {src ? (
                <PhotoFieldFilled
                    frameClassName={frameClassName}
                    src={src}
                    alt={alt}
                    hintId={hintId}
                    drop={drop}
                    onBrowse={browse}
                    onRemove={remove}
                />
            ) : (
                <PhotoFieldEmpty
                    buttonRef={dropzoneRef}
                    frameClassName={frameClassName}
                    hintId={hintId}
                    drop={drop}
                    onBrowse={browse}
                />
            )}
            <input
                ref={inputRef}
                data-testid="photo-input"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                hidden
                onChange={handleChange}
            />
            <p id={hintId} className={styles["photo-field__hint"]}>
                {t("photo.hint")}
            </p>
            {error && (
                <p role="alert" className={styles["photo-field__error"]}>
                    {error}
                </p>
            )}
        </div>
    );
};
