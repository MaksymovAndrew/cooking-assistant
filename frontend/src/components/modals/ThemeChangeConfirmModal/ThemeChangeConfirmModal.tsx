import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { THEME_STORAGE_KEY } from "constants/theme";

import { useAppDispatch } from "redux/hooks";
import type { ThemeChoice } from "redux/slices/themeSlice";
import { closeModal } from "redux/slices/uiSlice";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";

import { reloadPage } from "utils/reloadPage";

import styles from "./ThemeChangeConfirmModal.module.scss";

interface ThemeChangeConfirmModalProps {
    modalId: string;
    nextMode: ThemeChoice;
}

const ICON_SIZE = 26;
const ICON_BY_MODE = { dark: Moon, light: Sun, system: Monitor };
const TITLE_KEY_BY_MODE = {
    dark: "themeModal.titleDark",
    light: "themeModal.titleLight",
    system: "themeModal.titleSystem",
} as const;

// a full reload, not a live repaint: iOS Safari only recolors its status/address bars on a fresh load, never on an in-place theme toggle
export const ThemeChangeConfirmModal = ({
    modalId,
    nextMode,
}: ThemeChangeConfirmModalProps) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const ThemeIcon = ICON_BY_MODE[nextMode];

    const handleClose = () => dispatch(closeModal(modalId));

    const handleConfirm = () => {
        if (nextMode === "system") {
            localStorage.removeItem(THEME_STORAGE_KEY);
        } else {
            localStorage.setItem(THEME_STORAGE_KEY, nextMode);
        }

        reloadPage();
    };

    const title = t(TITLE_KEY_BY_MODE[nextMode]);

    const heading = (
        <span className={styles["theme-change-modal__heading"]}>
            <span className={styles["theme-change-modal__icon"]}>
                <ThemeIcon size={ICON_SIZE} aria-hidden="true" />
            </span>
            {title}
        </span>
    );

    return (
        <BaseModal
            onClose={handleClose}
            title={heading}
            footer={
                <>
                    <Button variant="secondary" onClick={handleClose}>
                        {t("modal.cancel")}
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        {t("themeModal.confirm")}
                    </Button>
                </>
            }
        >
            <p className={styles["theme-change-modal__message"]}>
                {t("themeModal.message")}
            </p>
        </BaseModal>
    );
};
