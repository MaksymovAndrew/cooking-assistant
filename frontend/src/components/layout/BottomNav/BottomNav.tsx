"use client";

import { usePathname } from "next/navigation";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

import { BOTTOM_NAV_ITEMS, GUEST_BOTTOM_NAV_ITEMS } from "constants/navigation";
import { ROUTES } from "constants/routes";

import { useAppSelector } from "redux/hooks";
import { selectIsGuest } from "redux/selectors/viewerSelectors";

import { useAddressBarReflowFix } from "hooks/useAddressBarReflowFix";

import { Link } from "components/ui/Link";

import { isActivePath } from "utils/isActivePath";
import { stripLocale } from "utils/localePath";
import { rememberLoginRedirect } from "utils/loginRedirect";

import styles from "./BottomNav.module.scss";

const ICON_SIZE = 21;
const ACTIVE_ICON_SIZE = 22;

export const BottomNav: React.FC = () => {
    const { t } = useTranslation();
    const navRef = useRef<HTMLElement>(null);
    const pathname = stripLocale(usePathname());
    const isGuest = useAppSelector(selectIsGuest);
    const items = isGuest ? GUEST_BOTTOM_NAV_ITEMS : BOTTOM_NAV_ITEMS;

    useAddressBarReflowFix(navRef);

    return (
        <nav ref={navRef} className={styles["bottom-nav"]}>
            <div className={styles["bottom-nav__content"]}>
                {items.map(({ href, labelKey, Icon }) => {
                    const isActive = isActivePath(href, pathname);

                    return (
                        <Link
                            key={href}
                            href={href}
                            // carries the guest back here after logging in from the tab bar
                            onClick={
                                href === ROUTES.login
                                    ? rememberLoginRedirect
                                    : undefined
                            }
                            className={[
                                styles["bottom-nav__item"],
                                isActive && styles["bottom-nav__item--active"],
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            <Icon
                                size={isActive ? ACTIVE_ICON_SIZE : ICON_SIZE}
                                aria-hidden="true"
                            />
                            <span>{t(labelKey)}</span>
                        </Link>
                    );
                })}
            </div>
            <div
                className={styles["bottom-nav__safe-area-spacer"]}
                aria-hidden="true"
            />
        </nav>
    );
};
