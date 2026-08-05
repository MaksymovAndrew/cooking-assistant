import type { ReactNode } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useAppSelector } from "redux/hooks";
import {
    selectIsAuthed,
    selectIsChecking,
} from "redux/selectors/sessionSelectors";
import { useGetMeQuery } from "redux/services/authApi";

import { ErrorState } from "components/ui/ErrorState";

import type { LoginRedirectState } from "utils/loginRedirect";
import { getQueryErrorStatus } from "utils/queryError";
import { reloadPage } from "utils/reloadPage";

import styles from "./PrivateRoute.module.scss";

const UNAUTHORIZED_STATUSES = [401, 403];

interface PrivateRouteProps {
    children?: ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { t } = useTranslation();
    const location = useLocation();
    // drives the session matchers; the slice tracks checking/authed/guest/error
    const { error } = useGetMeQuery(null);
    const isChecking = useAppSelector(selectIsChecking);
    const isAuthed = useAppSelector(selectIsAuthed);

    if (isChecking) return <div className="min-h-screen" />;
    if (isAuthed) return <>{children ?? <Outlet />}</>;

    const status = getQueryErrorStatus(error);
    const isUnauthorized =
        status !== null && UNAUTHORIZED_STATUSES.includes(status);

    if (isUnauthorized) {
        // carries where the guest was trying to go, so a successful login returns them there
        // instead of dropping them on the home dashboard - see utils/loginRedirect
        const state: LoginRedirectState = { from: location };

        return <Navigate to={ROUTES.login} state={state} replace />;
    }

    return (
        <div className={styles["private-route-error"]}>
            <ErrorState
                title={t("errorState.title")}
                description={t("sessionError")}
                onRetry={reloadPage}
                retryLabel={t("errorState.retry")}
            />
        </div>
    );
};
