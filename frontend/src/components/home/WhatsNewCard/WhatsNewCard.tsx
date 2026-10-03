import { Bell } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useLocale } from "hooks/useLocale";

import { cx } from "utils/cx";
import { formatNewsDateShort } from "utils/formatNewsDate";
import { getNewsItems } from "utils/newsItems";
import { isEntryUnseen } from "utils/newsReadState";

import styles from "./WhatsNewCard.module.scss";

interface WhatsNewCardProps {
    onOpenAll: () => void;
    unseenCount: number;
    lastSeenDate: string;
}

const ICON_SIZE = 17;
const VISIBLE_ITEMS = 3;

export const WhatsNewCard: React.FC<WhatsNewCardProps> = ({
    onOpenAll,
    unseenCount,
    lastSeenDate,
}) => {
    const { t } = useTranslation("news");
    const locale = useLocale();

    return (
        <button
            type="button"
            onClick={onOpenAll}
            className={styles["whats-new-card"]}
        >
            <div className={styles["whats-new-card__header"]}>
                <span className={styles["whats-new-card__title"]}>
                    <Bell size={ICON_SIZE} aria-hidden="true" />
                    {t("title")}
                </span>
                {unseenCount > 0 && (
                    <span className={styles["whats-new-card__badge"]}>
                        {t("newCount", { total: unseenCount })}
                    </span>
                )}
            </div>
            <div className={styles["whats-new-card__list"]}>
                {getNewsItems(t)
                    .slice(0, VISIBLE_ITEMS)
                    .map((entry) => (
                        <div
                            key={entry.id}
                            className={styles["whats-new-card__item"]}
                        >
                            <span
                                className={cx(
                                    styles["whats-new-card__dot"],
                                    isEntryUnseen(entry, lastSeenDate) &&
                                        styles["whats-new-card__dot--new"],
                                )}
                                aria-hidden="true"
                            />
                            <div
                                className={styles["whats-new-card__item-body"]}
                            >
                                <div
                                    className={
                                        styles["whats-new-card__item-title"]
                                    }
                                >
                                    {entry.title}
                                </div>
                                <div
                                    className={
                                        styles["whats-new-card__description"]
                                    }
                                >
                                    {entry.description}
                                </div>
                                <div className={styles["whats-new-card__date"]}>
                                    {formatNewsDateShort(entry.date, locale)}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </button>
    );
};
