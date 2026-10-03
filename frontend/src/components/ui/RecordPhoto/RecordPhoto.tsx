import React from "react";

import styles from "./RecordPhoto.module.scss";

interface RecordPhotoProps {
    src: string | null;
    fallback: React.ReactNode;
}

// the slot must be positioned and clip; alt is empty because the card names its record in text
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
