import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// every page renders "Cooking Assistant" as a static <title> otherwise - with public pages
// now reachable, that's what a crawler or a shared link shows for every single route
export const usePageTitle = (title?: string | null): void => {
    const { t } = useTranslation();
    const appName = t("appName");

    useEffect(() => {
        document.title = title ? `${title} - ${appName}` : appName;
    }, [title, appName]);
};
