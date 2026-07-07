import { Bell, X } from "lucide-react";
import React, { useId } from "react";
import { useTranslation } from "react-i18next";

import { NEWS_ITEMS } from "constants/news";

import { useEscapeKey } from "hooks/useEscapeKey";
import { useScrollLock } from "hooks/useScrollLock";

import { formatNewsDate } from "utils/formatNewsDate";

import styles from "./NewsModal.module.scss";

interface NewsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ICON_SIZE = 20;
const CLOSE_ICON_SIZE = 16;

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
                {/* only this wrapper scrolls, and it has no border-radius of
                    its own - a scrollbar on a rounded element isn't clipped
                    to the radius by the browser and pokes out past the
                    corner, so the radius/overflow:hidden stay on the outer,
                    non-scrolling box instead */}
                <div className={styles["news-modal__scroll"]}>
                    <div className={styles["news-modal__list"]}>
                        {NEWS_ITEMS.map((entry) => (
                            <div
                                key={entry.id}
                                className={styles["news-modal__item"]}
                            >
                                <div className={styles["news-modal__date"]}>
                                    {formatNewsDate(entry.date)}
                                </div>
                                <div
                                    className={styles["news-modal__item-title"]}
                                >
                                    {t(`items.${entry.id}.title`)}
                                </div>
                                <div
                                    className={
                                        styles["news-modal__description"]
                                    }
                                >
                                    {t(`items.${entry.id}.description`)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
