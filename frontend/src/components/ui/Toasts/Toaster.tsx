import { useAppSelector } from "redux/hooks";
import { selectNotifications } from "redux/selectors/notificationsSelectors";

import { Toast } from "components/ui/Toasts/Toast";

import styles from "./Toaster.module.scss";

const MAX_VISIBLE = 3;

export const Toaster = () => {
    const notifications = useAppSelector(selectNotifications);

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className={styles.toaster}>
            {notifications.slice(0, MAX_VISIBLE).map((notification) => (
                <Toast key={notification.id} notification={notification} />
            ))}
        </div>
    );
};
