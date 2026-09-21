import { ImagePlus } from "lucide-react";
import React, { useId, useRef } from "react";
import { useTranslation } from "react-i18next";

import { ACCEPTED_IMAGE_TYPES } from "constants/media";

import { Button } from "components/ui/Button";

import styles from "./PhotoField.module.scss";

const PLACEHOLDER_ICON_SIZE = 28;

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
    const hintId = useId();

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
            <div
                className={[
                    styles["photo-field__frame"],
                    shape === "round" && styles["photo-field__frame--round"],
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {src ? (
                    <img
                        className={styles["photo-field__image"]}
                        src={src}
                        alt={alt}
                    />
                ) : (
                    <ImagePlus
                        className={styles["photo-field__placeholder"]}
                        size={PLACEHOLDER_ICON_SIZE}
                        aria-hidden="true"
                    />
                )}
            </div>

            <div className={styles["photo-field__actions"]}>
                <Button
                    variant="secondary"
                    size="sm"
                    aria-describedby={hintId}
                    onClick={() => inputRef.current?.click()}
                >
                    {src ? t("photo.replace") : t("photo.choose")}
                </Button>
                {src && (
                    <Button variant="ghost" size="sm" onClick={onRemove}>
                        {t("photo.remove")}
                    </Button>
                )}
                <input
                    ref={inputRef}
                    data-testid="photo-input"
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    hidden
                    onChange={handleChange}
                />
            </div>

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
