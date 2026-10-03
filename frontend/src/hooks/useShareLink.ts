import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { addNotification } from "redux/slices/notificationsSlice";

import { shareLink } from "utils/shareLink";

// the query is dropped, so a filtered view isn't what travels
export const useShareLink = () => {
    const { t } = useTranslation("common");
    const dispatch = useAppDispatch();

    const share = async (title: string) => {
        const { origin, pathname } = window.location;
        const outcome = await shareLink(
            { title, url: `${origin}${pathname}` },
            navigator,
        );

        if (outcome === "copied") {
            dispatch(
                addNotification({
                    type: "success",
                    message: t("share.copied"),
                }),
            );
        } else if (outcome === "failed") {
            dispatch(
                addNotification({ type: "error", message: t("share.failed") }),
            );
        }
    };

    return { share };
};
