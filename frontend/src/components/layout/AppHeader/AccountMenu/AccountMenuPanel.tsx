import { Lock, LogOut, User } from "lucide-react";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useMenuArrowKeys } from "hooks/useMenuArrowKeys";

import type { AvatarProps } from "components/ui/Avatar";
import { Avatar } from "components/ui/Avatar";
import { Link } from "components/ui/Link";

import styles from "./AccountMenu.module.scss";
import { AccountMenuSettings } from "./AccountMenuSettings";

interface AccountMenuPanelProps {
    avatarProps: Omit<AvatarProps, "size">;
    displayName?: string;
    login?: string;
    onClose: () => void;
    onLogout: () => void;
}

const MENU_ICON_SIZE = 18;
const HEADER_AVATAR_SIZE = 40;

export const AccountMenuPanel: React.FC<AccountMenuPanelProps> = ({
    avatarProps,
    displayName,
    login,
    onClose,
    onLogout,
}) => {
    const { t } = useTranslation();
    const menuRef = useRef<HTMLDivElement>(null);
    const handleKeyDown = useMenuArrowKeys(menuRef);

    return (
        <div
            ref={menuRef}
            role="menu"
            tabIndex={-1}
            aria-label={t("accountMenu.trigger")}
            onKeyDown={handleKeyDown}
            className={styles["account-menu__panel"]}
        >
            <div className={styles["account-menu__header"]}>
                <Avatar {...avatarProps} size={HEADER_AVATAR_SIZE} />
                <span className={styles["account-menu__identity"]}>
                    <span className={styles["account-menu__name"]}>
                        {displayName}
                    </span>
                    {login && (
                        <span className={styles["account-menu__login"]}>
                            @{login}
                        </span>
                    )}
                </span>
            </div>
            <div className={styles["account-menu__divider"]} />
            <Link
                role="menuitem"
                href={ROUTES.profile}
                onClick={onClose}
                className={styles["account-menu__item"]}
            >
                <User size={MENU_ICON_SIZE} aria-hidden="true" />
                {t("accountMenu.profile")}
            </Link>
            <Link
                role="menuitem"
                href={ROUTES.settings}
                onClick={onClose}
                className={styles["account-menu__item"]}
            >
                <Lock size={MENU_ICON_SIZE} aria-hidden="true" />
                {t("accountMenu.settings")}
            </Link>
            <AccountMenuSettings />
            <div className={styles["account-menu__divider"]} />
            <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className={[
                    styles["account-menu__item"],
                    styles["account-menu__item--danger"],
                ].join(" ")}
            >
                <LogOut size={MENU_ICON_SIZE} aria-hidden="true" />
                {t("nav.logout")}
            </button>
        </div>
    );
};
