"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";

import { GUEST_NAV_ITEMS, NAV_ITEMS } from "constants/navigation";

import { useAppSelector } from "redux/hooks";
import { selectIsGuest } from "redux/selectors/viewerSelectors";

import { Link } from "components/ui/Link";

import { isActivePath } from "utils/isActivePath";
import { stripLocale } from "utils/localePath";

import styles from "./MainNav.module.scss";

export const MainNav: React.FC = () => {
    const { t } = useTranslation();
    const pathname = stripLocale(usePathname());
    const isGuest = useAppSelector(selectIsGuest);
    const items = isGuest ? GUEST_NAV_ITEMS : NAV_ITEMS;

    return (
        <nav className={styles["main-nav"]}>
            {items.map(({ href, labelKey }) => (
                <Link
                    key={href}
                    href={href}
                    className={[
                        styles["main-nav__item"],
                        isActivePath(href, pathname) &&
                            styles["main-nav__item--active"],
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    {t(labelKey)}
                </Link>
            ))}
        </nav>
    );
};
