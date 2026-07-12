import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { NAV_ITEMS } from "constants/navigation";

import styles from "./MainNav.module.scss";

export const MainNav: React.FC = () => {
    const { t } = useTranslation();

    return (
        <nav className={styles["main-nav"]}>
            {NAV_ITEMS.map(({ to, labelKey }) => (
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
