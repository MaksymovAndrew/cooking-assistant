import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";

import { BOTTOM_NAV_ITEMS, GUEST_BOTTOM_NAV_ITEMS } from "constants/navigation";
import { ROUTES } from "constants/routes";

import { useAppSelector } from "redux/hooks";
import { selectIsGuest } from "redux/selectors/viewerSelectors";

import { useAddressBarReflowFix } from "hooks/useAddressBarReflowFix";

import type { LoginRedirectState } from "utils/loginRedirect";

import styles from "./BottomNav.module.scss";

const ICON_SIZE = 21;
const ACTIVE_ICON_SIZE = 22;

export const BottomNav: React.FC = () => {
    const { t } = useTranslation();
    const navRef = useRef<HTMLElement>(null);
    const location = useLocation();
    const isGuest = useAppSelector(selectIsGuest);
    const items = isGuest ? GUEST_BOTTOM_NAV_ITEMS : BOTTOM_NAV_ITEMS;

    useAddressBarReflowFix(navRef);

    return (
        <nav ref={navRef} className={styles["bottom-nav"]}>
            <div className={styles["bottom-nav__content"]}>
                {items.map(({ to, labelKey, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        // carries the guest back here after logging in from the tab bar
                        state={
                            to === ROUTES.login
                                ? ({
                                      from: location,
                                  } satisfies LoginRedirectState)
                                : undefined
                        }
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
