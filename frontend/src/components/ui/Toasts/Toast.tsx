import type { LucideIcon } from "lucide-react";
import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import type { Notification } from "redux/slices/notificationsSlice";
import { removeNotification } from "redux/slices/notificationsSlice";

import styles from "./Toast.module.scss";

const AUTO_DISMISS_MS = 4000;
const LEAVE_DURATION_MS = 280;
const ICON_SIZE = 22;
const DISMISS_ICON_SIZE = 16;

const ICON_BY_TYPE: Record<Notification["type"], LucideIcon> = {
    success: CircleCheck,
    error: TriangleAlert,
    info: Info,
};

const TYPE_CLASS: Record<Notification["type"], string> = {
    success: styles["toast--success"],
    error: styles["toast--error"],
    info: styles["toast--info"],
};

export const Toast = ({ notification }: { notification: Notification }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [isLeaving, setIsLeaving] = useState(false);
    const Icon = ICON_BY_TYPE[notification.type];

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLeaving(true);
        }, AUTO_DISMISS_MS);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (!isLeaving) {
            return undefined;
        }

        const timer = setTimeout(
            () => dispatch(removeNotification(notification.id)),
            LEAVE_DURATION_MS,
        );

        return () => {
            clearTimeout(timer);
        };
    }, [isLeaving, dispatch, notification.id]);

    const classNames = [
        styles.toast,
        TYPE_CLASS[notification.type],
        isLeaving && styles["toast--leaving"],
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div role="status" className={classNames}>
            <span className={styles.toast__icon}>
                <Icon size={ICON_SIZE} aria-hidden="true" />
            </span>
            <p className={styles.toast__message}>{notification.message}</p>
            <button
                type="button"
                onClick={() => {
                    setIsLeaving(true);
                }}
                aria-label={t("toast.dismiss")}
                className={styles.toast__dismiss}
            >
                <X size={DISMISS_ICON_SIZE} aria-hidden="true" />
            </button>
            <span className={styles.toast__progress} aria-hidden="true" />
        </div>
    );
};
