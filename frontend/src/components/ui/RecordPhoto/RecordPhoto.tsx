import React from "react";

import styles from "./RecordPhoto.module.scss";

interface RecordPhotoProps {
    src: string | null;
    // what the slot shows when the record has no photo
    fallback: React.ReactNode;
}

// a card thumbnail: fills its slot, which must be positioned and clip its overflow. Decorative,
// because a card always names its record in text right beside it
export const RecordPhoto: React.FC<RecordPhotoProps> = ({ src, fallback }) =>
    src ? (
        <img
            className={styles["record-photo"]}
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
        />
    ) : (
        fallback
    );
