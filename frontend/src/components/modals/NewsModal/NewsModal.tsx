import { Bell, X } from "lucide-react";
import React, { useId } from "react";
import { useTranslation } from "react-i18next";

import { useEscapeKey } from "hooks/useEscapeKey";
import { useScrollLock } from "hooks/useScrollLock";

import { formatNewsDate } from "utils/formatNewsDate";
import { getNewsItems } from "utils/newsItems";

import styles from "./NewsModal.module.scss";

interface NewsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ICON_SIZE = 20;
const CLOSE_ICON_SIZE = 16;
const MAX_VISIBLE_ITEMS = 10;

export const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation("news");
    const titleId = useId();

    useEscapeKey(onClose, isOpen);
    useScrollLock(isOpen);

    if (!isOpen) {
        return null;
    }

    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    const visibleItems = getNewsItems().slice(0, MAX_VISIBLE_ITEMS);

    return (
        <div
            role="presentation"
            onClick={handleOverlayClick}
            className={styles["news-modal__overlay"]}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={styles["news-modal"]}
            >
                <div
                    className={styles["news-modal__handle"]}
                    aria-hidden="true"
                />
                <div className={styles["news-modal__header"]}>
                    <div className={styles["news-modal__heading"]}>
                        <span className={styles["news-modal__icon"]}>
                            <Bell size={ICON_SIZE} aria-hidden="true" />
                        </span>
                        <h3
                            id={titleId}
                            className={styles["news-modal__title"]}
                        >
                            {t("title")}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t("close")}
                        className={styles["news-modal__close"]}
                    >
                        <X size={CLOSE_ICON_SIZE} aria-hidden="true" />
                    </button>
                </div>
                {/* scrollbar lives here, not on the rounded outer box, so it can't poke past the corner */}
                <div className={styles["news-modal__scroll"]}>
                    <div className={styles["news-modal__list"]}>
                        {visibleItems.map((entry) => (
                            <div
                                key={entry.id}
                                className={styles["news-modal__item"]}
                            >
                                <span
                                    className={styles["news-modal__dot"]}
                                    aria-hidden="true"
                                />
                                <div
                                    className={styles["news-modal__item-body"]}
                                >
                                    <div
                                        className={
                                            styles["news-modal__item-title"]
                                        }
                                    >
                                        {entry.title}
                                    </div>
                                    <div
                                        className={
                                            styles["news-modal__description"]
                                        }
                                    >
                                        {entry.description}
                                    </div>
                                    <div className={styles["news-modal__date"]}>
                                        {formatNewsDate(entry.date)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
