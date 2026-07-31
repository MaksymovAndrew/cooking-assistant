import React from "react";
import { useTranslation } from "react-i18next";

import { MENU_SOURCE, useMenuListView } from "hooks/useMenuListView";

import { MenuListView } from "components/menu/MenuListView";

const MenuPage: React.FC = () => {
    const { t } = useTranslation("menu");
    const list = useMenuListView(MENU_SOURCE.all);

    const heading =
        list.filters.categories.length > 0
            ? t("menuPage.menusByCategories", {
                  names: list.selectedCategoryNames,
              })
            : t("menuPage.allMenus");

    return (
        <MenuListView
            {...list}
            heading={heading}
            subtitle={t("menuPage.subtitle", { count: list.total })}
            emptyTitle={t("menuPage.emptyTitle")}
            emptyDescription={t("menuPage.emptyDescription")}
            searchPlaceholder={t("menuPage.searchPlaceholder")}
            onRetry={() => {
                list.refetch().catch(() => undefined);
            }}
        />
    );
};

export default MenuPage;
