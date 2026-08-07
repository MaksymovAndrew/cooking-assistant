import type { ReactNode } from "react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "redux/hooks";
import {
    selectIsAuthed,
    selectIsChecking,
} from "redux/selectors/sessionSelectors";
import { selectIsGuest } from "redux/selectors/viewerSelectors";
import { useGetMeQuery } from "redux/services/authApi";

import { ErrorState } from "components/ui/ErrorState";

import { reloadPage } from "utils/reloadPage";

import styles from "./HomeRoute.module.scss";

interface HomeRouteProps {
    authedElement: ReactNode;
    guestElement: ReactNode;
}

// "/" is the one route whose content itself depends on auth status, not just its chrome -
// PrivateRoute's redirect-to-login doesn't apply here since a guest is allowed on "/", they
// just see the marketing landing instead of the dashboard
export const HomeRoute: React.FC<HomeRouteProps> = ({
    authedElement,
    guestElement,
}) => {
    const { t } = useTranslation();

    useGetMeQuery(null);
    const isChecking = useAppSelector(selectIsChecking);
    const isAuthed = useAppSelector(selectIsAuthed);
    const isGuest = useAppSelector(selectIsGuest);

    if (isChecking) return <div className="min-h-screen" />;
    if (isAuthed) return <>{authedElement}</>;
    if (isGuest) return <>{guestElement}</>;

    return (
        <div className={styles["home-route-error"]}>
            <ErrorState
                title={t("errorState.title")}
                description={t("sessionError")}
                onRetry={reloadPage}
                retryLabel={t("errorState.retry")}
            />
        </div>
    );
};
