import { Languages, SunMoon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "components/ui/LanguageSwitcher";
import { ThemeToggle } from "components/ui/ThemeToggle";

import styles from "./AccountMenu.module.scss";

const MENU_ICON_SIZE = 18;

// phones only: from tablet up both controls sit in the header
export const AccountMenuSettings: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <div className={styles["account-menu__setting"]}>
                <span className={styles["account-menu__setting-label"]}>
                    <Languages size={MENU_ICON_SIZE} aria-hidden="true" />
                    {t("accountMenu.language")}
                </span>
                <LanguageSwitcher
                    withIcon={false}
                    className={styles["account-menu__control"]}
                />
            </div>
            <div className={styles["account-menu__setting"]}>
                <span className={styles["account-menu__setting-label"]}>
                    <SunMoon size={MENU_ICON_SIZE} aria-hidden="true" />
                    {t("accountMenu.theme")}
                </span>
                <ThemeToggle className={styles["account-menu__control"]} />
            </div>
        </>
    );
};
