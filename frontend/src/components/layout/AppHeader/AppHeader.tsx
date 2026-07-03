import { LogOut } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useGetMeQuery } from "redux/services/authApi";

import { useLogoutModal } from "hooks/useLogoutModal";

import { Logo } from "components/layout/Logo";
import { MainNav } from "components/layout/MainNav";
import { Avatar } from "components/ui/Avatar";
import { ThemeToggle } from "components/ui/ThemeToggle";

import { getInitials } from "utils/getInitials";

import styles from "./AppHeader.module.scss";

const LOGOUT_ICON_SIZE = 18;

export const AppHeader: React.FC = () => {
    const { t } = useTranslation();
    const openLogoutModal = useLogoutModal();
    const { data: currentUser } = useGetMeQuery(null);
    const initials =
        currentUser?.name && currentUser.surname
            ? getInitials(currentUser.name, currentUser.surname)
            : undefined;

    return (
        <header className={styles["app-header"]}>
            <Logo to={ROUTES.home} />

            <div className={styles["app-header__nav"]}>
                <MainNav />
            </div>

            <div className={styles["app-header__actions"]}>
                <ThemeToggle />
                <button
                    type="button"
                    onClick={openLogoutModal}
                    aria-label={t("nav.logout")}
                    className={styles["app-header__logout-button"]}
                >
                    <LogOut size={LOGOUT_ICON_SIZE} aria-hidden="true" />
                </button>
                <Avatar initials={initials} />
            </div>
        </header>
    );
};
