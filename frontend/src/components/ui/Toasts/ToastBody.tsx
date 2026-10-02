import { useAppDispatch } from "redux/hooks";
import type { Notification } from "redux/slices/notificationsSlice";
import { runNotificationAction } from "redux/slices/notificationsSlice";

import { Link } from "components/ui/Link";

import styles from "./Toast.module.scss";

interface ToastBodyProps {
    notification: Notification;
    onLeave: () => void;
}

export const ToastBody = ({ notification, onLeave }: ToastBodyProps) => {
    const dispatch = useAppDispatch();
    const { message, link, action } = notification;

    return (
        <div className={styles.toast__body}>
            <p className={styles.toast__message}>{message}</p>
            {link && (
                <Link
                    href={link.href}
                    className={styles.toast__link}
                    onClick={onLeave}
                >
                    {link.label}
                </Link>
            )}
            {action && (
                <button
                    type="button"
                    className={styles.toast__action}
                    onClick={() => {
                        // the toast leaves at once, so a second press can't run the action twice
                        onLeave();
                        dispatch(runNotificationAction(action));
                    }}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};
