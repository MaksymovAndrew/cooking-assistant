import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { getErrorMessage } from "redux/middleware/notificationsListener";
import { useSignOutEverywhereMutation } from "redux/services/accountSecurityApi";
import { closeModal } from "redux/slices/uiSlice";

import { ConfirmModal } from "components/modals/ConfirmModal";

interface SignOutEverywhereModalProps {
    modalId: string;
}

export const SignOutEverywhereModal = ({
    modalId,
}: SignOutEverywhereModalProps) => {
    const { t } = useTranslation("settings");
    const dispatch = useAppDispatch();
    const [signOutEverywhere, { isLoading }] = useSignOutEverywhereMutation();
    const [error, setError] = useState<string | null>(null);

    // the success toast comes from the global listener; a failure stays inline, beside the button that caused it
    const handleConfirm = async () => {
        const result = await signOutEverywhere(null);

        if ("data" in result) {
            dispatch(closeModal(modalId));
        } else {
            setError(getErrorMessage(result.error));
        }
    };

    return (
        <ConfirmModal
            title={t("signOutEverywhereModal.title")}
            message={t("signOutEverywhereModal.message")}
            confirmLabel={t("signOutEverywhereModal.confirm")}
            confirmVariant="primary"
            isConfirmDisabled={isLoading}
            error={error}
            onClose={() => dispatch(closeModal(modalId))}
            onConfirm={() => void handleConfirm()}
        />
    );
};
