import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { BOTTOM_NAV_ITEMS } from "constants/navigation";

import { useAddressBarReflowFix } from "hooks/useAddressBarReflowFix";

import styles from "./BottomNav.module.scss";

const ICON_SIZE = 21;
const ACTIVE_ICON_SIZE = 22;

export const BottomNav: React.FC = () => {
    const { t } = useTranslation();
    const navRef = useRef<HTMLElement>(null);

    useAddressBarReflowFix(navRef);

    return (
        <nav ref={navRef} className={styles["bottom-nav"]}>
            <div className={styles["bottom-nav__content"]}>
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
                                    size={
                                        isActive ? ACTIVE_ICON_SIZE : ICON_SIZE
                                    }
                                    aria-hidden="true"
                                />
                                <span>{t(labelKey)}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
            <div
                className={styles["bottom-nav__safe-area-spacer"]}
                aria-hidden="true"
            />
        </nav>
    );
};
