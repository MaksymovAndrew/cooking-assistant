"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";

import { GUEST_NAV_ITEMS, NAV_ITEMS } from "constants/navigation";

import { useAppSelector } from "redux/hooks";
import { selectIsGuest } from "redux/selectors/viewerSelectors";

import { Link } from "components/ui/Link";

import { cx } from "utils/cx";
import { isActivePath } from "utils/isActivePath";
import { stripLocale } from "utils/localePath";

import styles from "./MainNav.module.scss";

export const MainNav: React.FC = () => {
    const { t } = useTranslation();
    const pathname = stripLocale(usePathname());
    const isGuest = useAppSelector(selectIsGuest);
    const items = isGuest ? GUEST_NAV_ITEMS : NAV_ITEMS;

    return (
        <nav aria-label={t("nav.mainLabel")} className={styles["main-nav"]}>
            {items.map(({ href, labelKey }) => {
                const isActive = isActivePath(href, pathname);

                return (
                    <Link
                        key={href}
                        href={href}
                        className={cx(
                            styles["main-nav__item"],
                            isActive && styles["main-nav__item--active"],
                        )}
                        aria-current={isActive ? "page" : undefined}
                    >
                        {t(labelKey)}
                    </Link>
                );
            })}
        </nav>
    );
};
