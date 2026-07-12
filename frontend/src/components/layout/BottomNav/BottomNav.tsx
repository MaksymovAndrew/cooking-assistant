import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { BOTTOM_NAV_ITEMS } from "constants/navigation";

import styles from "./BottomNav.module.scss";

const ICON_SIZE = 21;
const ACTIVE_ICON_SIZE = 22;

export const BottomNav: React.FC = () => {
    const { t } = useTranslation();

    return (
        <nav className={styles["bottom-nav"]}>
            {BOTTOM_NAV_ITEMS.map(({ to, labelKey, Icon }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        [
                            styles["bottom-nav__item"],
                            isActive && styles["bottom-nav__item--active"],
                        ]
                            .filter(Boolean)
                            .join(" ")
                    }
                >
                    {({ isActive }) => (
                        <>
                            <Icon
                                size={isActive ? ACTIVE_ICON_SIZE : ICON_SIZE}
                                aria-hidden="true"
                            />
                            <span>{t(labelKey)}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};
