import React from "react";

import { useCalorieLimitNotice } from "hooks/useCalorieLimitNotice";
import { useExpiredIngredientsNotice } from "hooks/useExpiredIngredientsNotice";

import { AppHeader } from "components/layout/AppHeader";
import { BottomNav } from "components/layout/BottomNav";
import { MobileSubpageHeader } from "components/layout/MobileSubpageHeader";
import { ScrollToTopButton } from "components/layout/ScrollToTopButton";
import { ensureCatalogLoaded } from "i18n/loadCatalog";

import styles from "./AppShell.module.scss";

// earliest point common to every authenticated page - starts the catalog loading as soon as possible
ensureCatalogLoaded().catch(() => undefined);

interface AppShellProps {
    children: React.ReactNode;
    // when set, mobile viewports show a back-button subpage header instead of the full app header (tablet+ always shows the full header)
    mobileBackTo?: string;
    mobileTitle?: string;
    mobileEditTo?: string;
    // opts a create/edit form page out of the expired-ingredients/calorie-limit popups (P4), which would otherwise interrupt mid-edit
    skipNotices?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
    children,
    mobileBackTo,
    mobileTitle,
    mobileEditTo,
    skipNotices = false,
}) => {
    useExpiredIngredientsNotice({ skip: skipNotices });
    useCalorieLimitNotice({ skip: skipNotices });

    return (
        <div className={styles["app-shell"]}>
            {mobileBackTo && (
                <MobileSubpageHeader
                    backTo={mobileBackTo}
                    title={mobileTitle}
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
            <main className={styles["app-shell__main"]}>{children}</main>
            <ScrollToTopButton />
            <BottomNav />
        </div>
    );
};
