import React from "react";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { ErrorState } from "components/ui/ErrorState";

import styles from "./RouteErrorBoundary.module.scss";

export const RouteErrorBoundary: React.FC = () => {
    const { t } = useTranslation();
    const error = useRouteError();

    const description = isRouteErrorResponse(error)
        ? t("routeError.responseDescription", { status: error.status })
        : t("routeError.description");

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className={styles["route-error-boundary"]}>
            <ErrorState
                title={t("errorState.title")}
                description={description}
                onRetry={handleRetry}
                retryLabel={t("errorState.retry")}
            />
            <Link
                to={ROUTES.home}
                className={styles["route-error-boundary__home"]}
            >
                {t("routeError.goHome")}
            </Link>
        </div>
    );
};
