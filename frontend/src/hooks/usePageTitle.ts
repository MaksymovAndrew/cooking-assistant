import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// every page renders "Cooking Assistant" as a static <title> otherwise - with public pages
// now reachable, that's what a crawler or a shared link shows for every single route
export const usePageTitle = (title?: string | null): void => {
    const { t } = useTranslation();
    const appName = t("appName");
    // the same pattern the server-rendered pages get from their metadata
    const template = t("meta.titleTemplate");

    useEffect(() => {
        document.title = title ? template.replace("%s", title) : appName;
    }, [title, appName, template]);
};
