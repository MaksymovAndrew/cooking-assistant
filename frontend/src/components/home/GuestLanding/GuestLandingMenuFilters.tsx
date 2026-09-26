import { Search } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useGetMenuCategoriesQuery } from "redux/services/menuCategoriesApi";

import { Link } from "components/ui/Link";
import { LinkButton } from "components/ui/LinkButton";

import { MENU_CATEGORY_URL_PARAM } from "utils/filters/menuFilterDefs";
import { menuCategoryName } from "utils/referenceLabels";

import styles from "./GuestLandingFilters.module.scss";

const SEARCH_ICON_SIZE = 18;

// each chip links straight to /all-menus with the category already in the URL - mirrors
// GuestLandingRecipeFilters, one source of truth for filtering
export const GuestLandingMenuFilters: React.FC = () => {
    const { t } = useTranslation("guestLanding");
    const { data: categories = [] } = useGetMenuCategoriesQuery(null);

    return (
        <div className={styles["guest-landing-filters"]}>
            <LinkButton
                href={ROUTES.allMenus}
                variant="secondary"
                className={styles["guest-landing-filters__search-button"]}
            >
                <Search size={SEARCH_ICON_SIZE} aria-hidden="true" />
                {t("searchMenusButton")}
            </LinkButton>
            <div className={styles["guest-landing-filters__chips"]}>
                <Link
                    href={ROUTES.allMenus}
                    className={[
                        styles["guest-landing-filters__chip"],
                        styles["guest-landing-filters__chip--active"],
                    ].join(" ")}
                >
                    {t("allChip")}
                </Link>
                {categories.map((category) => (
                    <Link
                        key={category.menu_category_id}
                        href={`${ROUTES.allMenus}?${MENU_CATEGORY_URL_PARAM}=${category.menu_category_id}`}
                        className={styles["guest-landing-filters__chip"]}
                    >
                        {menuCategoryName(t, category.category_name)}
                    </Link>
                ))}
            </div>
        </div>
    );
};
