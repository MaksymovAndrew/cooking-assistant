import React from "react";

import { ROUTES } from "constants/routes";

import { useGetMeQuery } from "redux/services/authApi";

import { useLogoutModal } from "hooks/useLogoutModal";

import { AccountMenu } from "components/layout/AppHeader/AccountMenu";
import { Logo } from "components/layout/Logo";
import { MainNav } from "components/layout/MainNav";
import { ThemeToggle } from "components/ui/ThemeToggle";

import styles from "./AppHeader.module.scss";

export const AppHeader: React.FC = () => {
    const openLogoutModal = useLogoutModal();
    const { data: currentUser } = useGetMeQuery(null);

    return (
        <header className={styles["app-header"]}>
            <Logo to={ROUTES.home} />

            <div className={styles["app-header__nav"]}>
                <MainNav />
            </div>

            <div className={styles["app-header__actions"]}>
                <div className={styles["app-header__theme-toggle"]}>
                    <ThemeToggle />
                </div>
                <AccountMenu
                    name={currentUser?.name}
                    surname={currentUser?.surname}
                    login={currentUser?.login}
                    onLogout={openLogoutModal}
                />
            </div>
        </header>
    );
};
