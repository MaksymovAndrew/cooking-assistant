import React from "react";

import { useCalorieLimitNotice } from "hooks/useCalorieLimitNotice";
import { useExpiredIngredientsNotice } from "hooks/useExpiredIngredientsNotice";

import { AppHeader } from "components/layout/AppHeader";
import { BottomNav } from "components/layout/BottomNav";
import { MobileSubpageHeader } from "components/layout/MobileSubpageHeader";
import { ScrollToTopButton } from "components/layout/ScrollToTopButton";

import styles from "./AppShell.module.scss";

interface AppShellProps {
    children: React.ReactNode;
    // when set, mobile viewports show a back-button subpage header instead of the full app header (tablet+ always shows the full header)
    mobileBackTo?: string;
    mobileTitle?: string;
    mobileEditTo?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
    children,
    mobileBackTo,
    mobileTitle,
    mobileEditTo,
}) => {
    useExpiredIngredientsNotice();
    useCalorieLimitNotice();

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
