import { ChevronDown } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useIsHydrated } from "hooks/useIsHydrated";
import { usePopoverDismiss } from "hooks/usePopoverDismiss";

import { Avatar } from "components/ui/Avatar";

import { personDisplayName, personInitials } from "utils/personName";

import styles from "./AccountMenu.module.scss";
import { AccountMenuPanel } from "./AccountMenuPanel";

interface AccountMenuProps {
    name?: string;
    surname?: string;
    login?: string;
    avatar?: string | null;
    avatarPhotoKey?: string | null;
    onLogout: () => void;
}

const CHEVRON_SIZE = 15;
const TRIGGER_AVATAR_SIZE = 32;

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
        initials: personInitials({ name, surname }),
        avatarKey: avatar,
        photoKey: avatarPhotoKey,
    };
    const displayName = personDisplayName({ name, surname, login });

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
                <AccountMenuPanel
                    avatarProps={avatarProps}
                    displayName={displayName}
                    login={login}
                    onClose={closeMenu}
                    onLogout={onLogout}
                />
            )}
        </div>
    );
};
