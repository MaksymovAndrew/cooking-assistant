import { useTranslation } from "react-i18next";

import { THEME_STORAGE_KEY } from "constants/theme";

import { useAppDispatch } from "redux/hooks";
import type { ThemeMode } from "redux/slices/themeSlice";
import { closeModal } from "redux/slices/uiSlice";

import { ConfirmModal } from "components/modals/ConfirmModal";

import { reloadPage } from "utils/reloadPage";

interface ThemeChangeConfirmModalProps {
    modalId: string;
    nextMode: ThemeMode;
}

// a full reload, not a live repaint: iOS Safari only recolors its status/address
// bars on a fresh load, never on an in-place theme toggle
export const ThemeChangeConfirmModal = ({
    modalId,
    nextMode,
}: ThemeChangeConfirmModalProps) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const handleConfirm = () => {
        localStorage.setItem(THEME_STORAGE_KEY, nextMode);
        reloadPage();
    };

    return (
        <ConfirmModal
            title={t("themeModal.title")}
            message={t("themeModal.message")}
            confirmLabel={t("themeModal.confirm")}
            confirmVariant="primary"
            onClose={() => dispatch(closeModal(modalId))}
            onConfirm={handleConfirm}
        />
    );
};
