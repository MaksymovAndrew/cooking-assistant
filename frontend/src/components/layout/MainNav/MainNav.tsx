import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { GUEST_NAV_ITEMS, NAV_ITEMS } from "constants/navigation";

import { useAppSelector } from "redux/hooks";
import { selectIsGuest } from "redux/selectors/viewerSelectors";

import styles from "./MainNav.module.scss";

export const MainNav: React.FC = () => {
    const { t } = useTranslation();
    const isGuest = useAppSelector(selectIsGuest);
    const items = isGuest ? GUEST_NAV_ITEMS : NAV_ITEMS;

    return (
        <nav className={styles["main-nav"]}>
            {items.map(({ to, labelKey }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        [
                            styles["main-nav__item"],
                            isActive && styles["main-nav__item--active"],
                        ]
                            .filter(Boolean)
                            .join(" ")
                    }
                >
                    {t(labelKey)}
                </NavLink>
            ))}
        </nav>
    );
};
