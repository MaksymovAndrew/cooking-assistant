import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useAppDispatch } from "redux/hooks";
import { getErrorMessage } from "redux/middleware/notificationsListener";
import { useLogoutMutation } from "redux/services/authApi";
import { baseApi } from "redux/services/baseApi";
import { closeModal } from "redux/slices/uiSlice";

import { ConfirmModal } from "components/modals/ConfirmModal";

interface LogoutConfirmModalProps {
    modalId: string;
}

export const LogoutConfirmModal = ({ modalId }: LogoutConfirmModalProps) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [logout, { isLoading }] = useLogoutMutation();
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        // success toast is handled by the global listener; a failed logout is excluded there on purpose (no scary app-wide error), so it's surfaced inline here instead
        const result = await logout(null);

        if ("data" in result) {
            // drop every cached query so the next user starts clean
            dispatch(baseApi.util.resetApiState());
            dispatch(closeModal(modalId));
            void navigate(ROUTES.login);
        } else {
            setError(getErrorMessage(result.error));
        }
    };

    return (
        <ConfirmModal
            title={t("logoutModal.title")}
            message={t("logoutModal.message")}
            confirmLabel={t("logoutModal.confirm")}
            confirmVariant="primary"
            isConfirmDisabled={isLoading}
            error={error}
            onClose={() => dispatch(closeModal(modalId))}
            onConfirm={() => void handleConfirm()}
        />
    );
};
