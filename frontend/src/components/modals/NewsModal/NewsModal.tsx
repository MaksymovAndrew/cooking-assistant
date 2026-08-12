import { Bell } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { closeModal } from "redux/slices/uiSlice";

import { BaseModal } from "components/modals/BaseModal";

import { formatNewsDate } from "utils/formatNewsDate";
import { getNewsItems } from "utils/newsItems";

import styles from "./NewsModal.module.scss";

interface NewsModalProps {
    modalId: string;
}

const ICON_SIZE = 20;
const MAX_VISIBLE_ITEMS = 10;

export const NewsModal: React.FC<NewsModalProps> = ({ modalId }) => {
    const { t } = useTranslation("news");
    const dispatch = useAppDispatch();

    const handleClose = () => dispatch(closeModal(modalId));

    const visibleItems = getNewsItems().slice(0, MAX_VISIBLE_ITEMS);

    const heading = (
        <span className={styles["news-modal__heading"]}>
            <span className={styles["news-modal__icon"]}>
                <Bell size={ICON_SIZE} aria-hidden="true" />
            </span>
            <span>{t("title")}</span>
        </span>
    );

    return (
        <BaseModal
            size="md"
            title={heading}
            onClose={handleClose}
            showCloseButton
        >
            <ul className={styles["news-modal__list"]}>
                {visibleItems.map((entry) => (
                    <li key={entry.id} className={styles["news-modal__item"]}>
                        <span
                            className={styles["news-modal__dot"]}
                            aria-hidden="true"
                        />
                        <div className={styles["news-modal__item-body"]}>
                            <div className={styles["news-modal__item-title"]}>
                                {entry.title}
                            </div>
                            <div className={styles["news-modal__description"]}>
                                {entry.description}
                            </div>
                            <div className={styles["news-modal__date"]}>
                                {formatNewsDate(entry.date)}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </BaseModal>
    );
};
