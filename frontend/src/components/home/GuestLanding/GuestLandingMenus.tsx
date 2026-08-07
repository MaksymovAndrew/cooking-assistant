import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { MOBILE_MEDIA_QUERY } from "constants/breakpoints";
import { ROUTES } from "constants/routes";

import { flattenPages } from "redux/services/infiniteQueryHelpers";
import { useGetMenusInfiniteQuery } from "redux/services/menusApi";

import { useMediaQuery } from "hooks/useMediaQuery";

import { NotebookMark } from "components/icons";
import { MenuCard } from "components/menu/MenuCard";
import { EmptyState } from "components/ui/EmptyState";

import styles from "./GuestLanding.module.scss";

const SEE_ALL_ICON_SIZE = 15;
const MENU_COUNT = 4;

// reuses the same MenuCard as /all-menus and every other menu list in the app - no bespoke
// card style for the landing page
export const GuestLandingMenus: React.FC = () => {
    const { t } = useTranslation("guestLanding");
    const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
    // same request /all-menus fires with no filters applied, so it's already cached once a
    // guest clicks through - the count is trimmed client-side, not by a second endpoint
    const { data } = useGetMenusInfiniteQuery({});
    const menus = flattenPages(data).slice(0, MENU_COUNT);

    return (
        <section className={styles["guest-landing-section"]}>
            <div className={styles["guest-landing-section__header"]}>
                <h2 className={styles["guest-landing-section__title"]}>
                    {t("menusTitle")}
                </h2>
                <Link
                    to={ROUTES.allMenus}
                    className={styles["guest-landing-section__see-all"]}
                >
                    {t("seeAllMenus")}
                    <ChevronRight size={SEE_ALL_ICON_SIZE} aria-hidden="true" />
                </Link>
            </div>
            {menus.length === 0 ? (
                <EmptyState
                    icon={NotebookMark}
                    title={t("emptyMenusTitle")}
                    description={t("emptyMenusDescription")}
                />
            ) : (
                <div className={styles["guest-landing-section__menu-grid"]}>
                    {menus.map((menu) => (
                        <MenuCard
                            key={menu.id}
                            id={menu.id}
                            title={menu.title}
                            categoryName={menu.categoryname}
                            recipeCount={menu.recipe_count}
                            variant={isMobile ? "row" : "grid"}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
