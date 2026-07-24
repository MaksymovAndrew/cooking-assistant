import type { ReactNode } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useAppSelector } from "redux/hooks";
import {
    selectIsAuthed,
    selectIsChecking,
} from "redux/selectors/sessionSelectors";
import { useGetMeQuery } from "redux/services/authApi";

import { ErrorState } from "components/ui/ErrorState";

import { getQueryErrorStatus } from "utils/queryError";
import { reloadPage } from "utils/reloadPage";

import styles from "./PrivateRoute.module.scss";

const UNAUTHORIZED_STATUSES = [401, 403];

interface PrivateRouteProps {
    children?: ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { t } = useTranslation();
    // drives the session matchers; the slice tracks checking/authed/error
    const { error } = useGetMeQuery(null);
    const isChecking = useAppSelector(selectIsChecking);
    const isAuthed = useAppSelector(selectIsAuthed);

    if (isChecking) return <div className="min-h-screen" />;
    if (isAuthed) return <>{children ?? <Outlet />}</>;

    const status = getQueryErrorStatus(error);
    const isUnauthorized =
        status !== null && UNAUTHORIZED_STATUSES.includes(status);

    if (isUnauthorized) return <Navigate to={ROUTES.login} replace />;

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
