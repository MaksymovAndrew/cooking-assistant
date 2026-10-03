import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { MOBILE_MEDIA_QUERY } from "constants/breakpoints";
import { GUEST_LANDING_MENU_COUNT } from "constants/guestLanding";
import { ROUTES } from "constants/routes";
import type { Menu } from "types/menu";

import { flattenPages } from "redux/services/infiniteQueryHelpers";
import { useGetMenusInfiniteQuery } from "redux/services/menusApi";

import { useMediaQuery } from "hooks/useMediaQuery";

import { NotebookMark } from "components/icons";
import { MenuCard } from "components/menu/MenuCard";
import { EmptyState } from "components/ui/EmptyState";
import { Link } from "components/ui/Link";

import styles from "./GuestLanding.module.scss";

const SEE_ALL_ICON_SIZE = 15;

interface GuestLandingMenusProps {
    // null when the server could not load them
    menus: Menu[] | null;
}

export const GuestLandingMenus: React.FC<GuestLandingMenusProps> = ({
    menus: loaded,
}) => {
    const { t } = useTranslation("guestLanding");
    const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
    // the unfiltered /all-menus request, trimmed here; skipped when the server sent the menus
    const { data } = useGetMenusInfiniteQuery({}, { skip: loaded !== null });
    const menus = (loaded ?? flattenPages(data)).slice(
        0,
        GUEST_LANDING_MENU_COUNT,
    );

    return (
        <section className={styles["guest-landing-section"]}>
            <div className={styles["guest-landing-section__header"]}>
                <h2 className={styles["guest-landing-section__title"]}>
                    {t("menusTitle")}
                </h2>
                <Link
                    href={ROUTES.allMenus}
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
                            menu={menu}
                            variant={isMobile ? "row" : "grid"}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
