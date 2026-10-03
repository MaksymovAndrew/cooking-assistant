import type { ReactNode } from "react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ContentSkeleton } from "components/ui/ContentSkeleton";
import { ErrorState } from "components/ui/ErrorState";

interface AsyncContentProps {
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    rows?: number;
    children: ReactNode;
}

export const AsyncContent: React.FC<AsyncContentProps> = ({
    isLoading,
    isError,
    onRetry,
    rows,
    children,
}) => {
    const { t } = useTranslation();

    if (isError) {
        return (
            <ErrorState
                title={t("errorState.title")}
                description={t("errorState.loadFailed")}
                onRetry={onRetry}
                retryLabel={t("errorState.retry")}
            />
        );
    }

    if (isLoading) {
        return <ContentSkeleton rows={rows} />;
    }

    return <>{children}</>;
};
