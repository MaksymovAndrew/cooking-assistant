import React, { useId } from "react";

import type { useRecordPhotoDraft } from "hooks/useRecordPhotoDraft";

import { FormCard } from "components/ui/FormCard";
import { PhotoField } from "components/ui/PhotoField";

import styles from "./FormPhotoCard.module.scss";

interface FormPhotoCardProps {
    photo: ReturnType<typeof useRecordPhotoDraft>;
    title: string;
    alt: string;
}

export const FormPhotoCard: React.FC<FormPhotoCardProps> = ({
    photo,
    title,
    alt,
}) => {
    const titleId = useId();

    return (
        <FormCard>
            <div role="group" aria-labelledby={titleId}>
                <span id={titleId} className={styles["form-photo-card__title"]}>
                    {title}
                </span>
                <PhotoField
                    src={photo.src}
                    alt={alt}
                    error={photo.error}
                    onChoose={photo.choose}
                    onRemove={photo.remove}
                />
            </div>
        </FormCard>
    );
};
