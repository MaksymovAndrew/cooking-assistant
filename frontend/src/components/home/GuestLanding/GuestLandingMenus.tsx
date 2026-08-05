import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { flattenPages } from "redux/services/infiniteQueryHelpers";
import { useGetMenusInfiniteQuery } from "redux/services/menusApi";

import { NotebookMark } from "components/icons";
import { EmptyState } from "components/ui/EmptyState";

import styles from "./GuestLanding.module.scss";
import { GuestLandingMenuCard } from "./GuestLandingMenuCard";

const SEE_ALL_ICON_SIZE = 15;
const MENU_COUNT = 3;

// hidden below tablet width (see &--menus in GuestLanding.module.scss) - the mockup drops this
// section entirely on mobile rather than cramming a third content block under the fold
export const GuestLandingMenus: React.FC = () => {
    const { t } = useTranslation("guestLanding");
    const { data } = useGetMenusInfiniteQuery({});
    const menus = flattenPages(data).slice(0, MENU_COUNT);

    return (
        <section
            className={[
                styles["guest-landing-section"],
                styles["guest-landing-section--menus"],
            ].join(" ")}
        >
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
                        <GuestLandingMenuCard
                            key={menu.id}
                            id={menu.id}
                            title={menu.title}
                            description={menu.menucontent}
                            recipeCount={menu.recipe_count}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
