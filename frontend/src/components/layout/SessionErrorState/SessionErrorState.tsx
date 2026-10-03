import React from "react";
import { useTranslation } from "react-i18next";

import { ErrorState } from "components/ui/ErrorState";

import { reloadPage } from "utils/reloadPage";

import styles from "./SessionErrorState.module.scss";

export const SessionErrorState: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className={styles["session-error-state"]}>
            <ErrorState
                title={t("errorState.title")}
                description={t("sessionError")}
                onRetry={reloadPage}
                retryLabel={t("errorState.retry")}
            />
        </div>
    );
};
