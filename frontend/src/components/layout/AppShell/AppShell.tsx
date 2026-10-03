import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { MAIN_CONTENT_ID } from "constants/landmarks";

import { useCalorieLimitNotice } from "hooks/useCalorieLimitNotice";
import { useExpiredIngredientsNotice } from "hooks/useExpiredIngredientsNotice";

import { AppHeader } from "components/layout/AppHeader";
import { BottomNav } from "components/layout/BottomNav";
import { MobileSubpageHeader } from "components/layout/MobileSubpageHeader";
import { ScrollToTopButton } from "components/layout/ScrollToTopButton";
import { SkipLink } from "components/layout/SkipLink";
import { ensureCatalogLoaded } from "i18n/loadCatalog";

import styles from "./AppShell.module.scss";

interface AppShellProps {
    children: React.ReactNode;
    mobileBackTo?: string;
    mobileEditTo?: string;
    // form pages skip the expired and calorie popups, which would interrupt mid-edit
    skipNotices?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
    children,
    mobileBackTo,
    mobileEditTo,
    skipNotices = false,
}) => {
    const { i18n } = useTranslation();

    // every page with ingredient names renders inside the shell; a failed load keeps the stored names
    useEffect(() => {
        ensureCatalogLoaded(i18n).catch(() => undefined);
    }, [i18n]);

    useExpiredIngredientsNotice({ skip: skipNotices });
    useCalorieLimitNotice({ skip: skipNotices });

    return (
        <div className={styles["app-shell"]}>
            <SkipLink />
            {mobileBackTo && (
                <MobileSubpageHeader
                    backTo={mobileBackTo}
                    editTo={mobileEditTo}
                />
            )}
            <div
                className={
                    mobileBackTo
                        ? styles["app-shell__header--desktop-only"]
                        : undefined
                }
            >
                <AppHeader />
            </div>
            <main
                id={MAIN_CONTENT_ID}
                tabIndex={-1}
                className={styles["app-shell__main"]}
            >
                {children}
            </main>
            <ScrollToTopButton />
            <BottomNav />
        </div>
    );
};
