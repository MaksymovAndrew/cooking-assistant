import { ChevronDown, Lock, LogOut, User } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useIsHydrated } from "hooks/useIsHydrated";
import { usePopoverDismiss } from "hooks/usePopoverDismiss";

import { Avatar } from "components/ui/Avatar";
import { Link } from "components/ui/Link";

import { getInitials } from "utils/getInitials";

import styles from "./AccountMenu.module.scss";

interface AccountMenuProps {
    name?: string;
    surname?: string;
    login?: string;
    avatar?: string | null;
    avatarPhotoKey?: string | null;
    onLogout: () => void;
}

const CHEVRON_SIZE = 15;
const MENU_ICON_SIZE = 18;
const TRIGGER_AVATAR_SIZE = 32;
const HEADER_AVATAR_SIZE = 40;

export const AccountMenu: React.FC<AccountMenuProps> = ({
    name,
    surname,
    login,
    avatar,
    avatarPhotoKey,
    onLogout,
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const avatarProps = {
        initials: name && surname ? getInitials(name, surname) : undefined,
        avatarKey: avatar,
        photoKey: avatarPhotoKey,
    };
    const displayName = name && surname ? `${name} ${surname}` : login;

    const closeMenu = () => {
        setIsOpen(false);
    };

    const isHydrated = useIsHydrated();

    usePopoverDismiss(containerRef, isOpen, closeMenu);

    return (
        <div ref={containerRef} className={styles["account-menu"]}>
            <button
                type="button"
                onClick={() => {
                    setIsOpen((prev) => !prev);
                }}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label={t("accountMenu.trigger")}
                // the header is on screen before React hydrates, and until then this opens nothing
                disabled={!isHydrated}
                className={styles["account-menu__trigger"]}
            >
                <Avatar {...avatarProps} size={TRIGGER_AVATAR_SIZE} />
                <ChevronDown
                    size={CHEVRON_SIZE}
                    aria-hidden="true"
                    className={styles["account-menu__chevron"]}
                />
            </button>
            {isOpen && (
                <div role="menu" className={styles["account-menu__panel"]}>
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
                        onClick={closeMenu}
                        className={styles["account-menu__item"]}
                    >
                        <User size={MENU_ICON_SIZE} aria-hidden="true" />
                        {t("accountMenu.profile")}
                    </Link>
                    <Link
                        role="menuitem"
                        href={ROUTES.settings}
                        onClick={closeMenu}
                        className={styles["account-menu__item"]}
                    >
                        <Lock size={MENU_ICON_SIZE} aria-hidden="true" />
                        {t("accountMenu.settings")}
                    </Link>
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
            )}
        </div>
    );
};
