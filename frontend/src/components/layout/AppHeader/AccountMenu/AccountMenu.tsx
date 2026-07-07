import { ChevronDown, Lock, LogOut, User } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { usePopoverDismiss } from "hooks/usePopoverDismiss";

import { Avatar } from "components/ui/Avatar";

import { getInitials } from "utils/getInitials";

import styles from "./AccountMenu.module.scss";

interface AccountMenuProps {
    name?: string;
    surname?: string;
    login?: string;
    onLogout: () => void;
}

const CHEVRON_SIZE = 15;
const MENU_ICON_SIZE = 18;
const HEADER_AVATAR_SIZE = 40;

export const AccountMenu: React.FC<AccountMenuProps> = ({
    name,
    surname,
    login,
    onLogout,
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const initials = name && surname ? getInitials(name, surname) : undefined;
    const displayName = name && surname ? `${name} ${surname}` : login;

    const closeMenu = () => {
        setIsOpen(false);
    };

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
                className={styles["account-menu__trigger"]}
            >
                <Avatar initials={initials} />
                <ChevronDown size={CHEVRON_SIZE} aria-hidden="true" />
            </button>
            {isOpen && (
                <div role="menu" className={styles["account-menu__panel"]}>
                    <div className={styles["account-menu__header"]}>
                        <Avatar initials={initials} size={HEADER_AVATAR_SIZE} />
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
                        to={ROUTES.profile}
                        onClick={closeMenu}
                        className={styles["account-menu__item"]}
                    >
                        <User size={MENU_ICON_SIZE} aria-hidden="true" />
                        {t("accountMenu.profile")}
                    </Link>
                    <Link
                        role="menuitem"
                        to={ROUTES.settings}
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
