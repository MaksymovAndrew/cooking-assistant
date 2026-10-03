import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { storeThemeChoice, type ThemeChoice } from "redux/slices/themeSlice";
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

// a full reload: iOS Safari recolors its status and address bars only on a fresh load
export const ThemeChangeConfirmModal = ({
    modalId,
    nextMode,
}: ThemeChangeConfirmModalProps) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const ThemeIcon = ICON_BY_MODE[nextMode];

    const handleClose = () => dispatch(closeModal(modalId));

    const handleConfirm = () => {
        storeThemeChoice(nextMode);
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
