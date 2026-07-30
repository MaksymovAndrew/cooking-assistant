import React from "react";
import { useTranslation } from "react-i18next";

import { MENU_SOURCE, useMenuListView } from "hooks/useMenuListView";

import { MenuListView } from "components/menu/MenuListView";

const UserMenuPage: React.FC = () => {
    const { t } = useTranslation("menu");

    const list = useMenuListView(MENU_SOURCE.person);

    const heading =
        list.filters.categories.length > 0
            ? t("userMenuPage.menusByCategories", {
                  names: list.selectedCategoryNames,
              })
            : t("userMenuPage.myMenus");

    return (
        <MenuListView
            {...list}
            heading={heading}
            subtitle={t("userMenuPage.subtitle", { count: list.total })}
            emptyTitle={t("userMenuPage.emptyTitle")}
            emptyDescription={t("userMenuPage.emptyDescription")}
            searchPlaceholder={t("userMenuPage.searchPlaceholder")}
            onRetry={() => {
                list.refetch().catch(() => undefined);
            }}
            mine
        />
    );
};

export default UserMenuPage;
