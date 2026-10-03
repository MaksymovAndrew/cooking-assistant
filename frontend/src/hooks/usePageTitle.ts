import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// a client page exports no metadata, so without this its <title> is only the app name
export const usePageTitle = (title?: string | null): void => {
    const { t } = useTranslation();
    const appName = t("appName");
    // the same pattern the server-rendered pages get from their metadata
    const template = t("meta.titleTemplate");

    useEffect(() => {
        document.title = title ? template.replace("%s", title) : appName;
    }, [title, appName, template]);
};
