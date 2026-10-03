import { SearchX } from "lucide-react";
import type { ReactNode } from "react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ContentSkeleton } from "components/ui/ContentSkeleton";
import { EmptyState } from "components/ui/EmptyState";
import { ErrorState } from "components/ui/ErrorState";
import { LinkButton } from "components/ui/LinkButton";

import type { EditPageState } from "utils/editPageState";
import { EDIT_PAGE_STATE } from "utils/editPageState";

interface EditRecordGateProps {
    state: EditPageState;
    onRetry: () => void;
    notFoundTitle: string;
    notFoundDescription: string;
    backHref: string;
    backLabel: string;
    children: ReactNode;
}

const FORM_SKELETON_ROWS = 8;

export const EditRecordGate: React.FC<EditRecordGateProps> = ({
    state,
    onRetry,
    notFoundTitle,
    notFoundDescription,
    backHref,
    backLabel,
    children,
}) => {
    const { t } = useTranslation();

    if (state === EDIT_PAGE_STATE.loading) {
        return <ContentSkeleton rows={FORM_SKELETON_ROWS} />;
    }

    if (state === EDIT_PAGE_STATE.error) {
        return (
            <ErrorState
                title={t("errorState.title")}
                description={t("errorState.loadFailed")}
                onRetry={onRetry}
                retryLabel={t("errorState.retry")}
            />
        );
    }

    if (state === EDIT_PAGE_STATE.notFound) {
        return (
            <EmptyState
                icon={SearchX}
                title={notFoundTitle}
                description={notFoundDescription}
                action={
                    <LinkButton href={backHref} variant="secondary">
                        {backLabel}
                    </LinkButton>
                }
            />
        );
    }

    return <>{children}</>;
};
