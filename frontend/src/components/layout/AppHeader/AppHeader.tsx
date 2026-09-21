import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useAppSelector } from "redux/hooks";
import { selectIsGuest } from "redux/selectors/viewerSelectors";
import { useGetMeQuery } from "redux/services/authApi";

import { useLogoutModal } from "hooks/useLogoutModal";

import { AccountMenu } from "components/layout/AppHeader/AccountMenu";
import { Logo } from "components/layout/Logo";
import { MainNav } from "components/layout/MainNav";
import { LinkButton } from "components/ui/LinkButton";
import { ThemeToggle } from "components/ui/ThemeToggle";

import { rememberLoginRedirect } from "utils/loginRedirect";

import styles from "./AppHeader.module.scss";

export const AppHeader: React.FC = () => {
    const { t } = useTranslation();
    const isGuest = useAppSelector(selectIsGuest);
    const openLogoutModal = useLogoutModal();
    // only the AccountMenu branch below needs this - skip it once the session is definitively
    // guest so AppHeader doesn't fire its own redundant /api/me alongside HomeRoute/PrivateRoute's
    const { data: currentUser } = useGetMeQuery(null, { skip: isGuest });

    return (
        <header className={styles["app-header"]}>
            <Logo href={ROUTES.home} />

            <div className={styles["app-header__nav"]}>
                <MainNav />
            </div>

            <div className={styles["app-header__actions"]}>
                <div className={styles["app-header__theme-toggle"]}>
                    <ThemeToggle />
                </div>
                {isGuest ? (
                    <div className={styles["app-header__guest-actions"]}>
                        <LinkButton
                            href={ROUTES.login}
                            onClick={rememberLoginRedirect}
                            variant="ghost"
                            size="sm"
                        >
                            {t("nav.login")}
                        </LinkButton>
                        <LinkButton
                            href={ROUTES.registration}
                            variant="primary"
                            size="sm"
                        >
                            {t("nav.register")}
                        </LinkButton>
                    </div>
                ) : (
                    <AccountMenu
                        name={currentUser?.name}
                        surname={currentUser?.surname}
                        login={currentUser?.login}
                        avatar={currentUser?.avatar}
                        avatarPhotoKey={currentUser?.avatar_photo_key}
                        onLogout={openLogoutModal}
                    />
                )}
            </div>
        </header>
    );
};
