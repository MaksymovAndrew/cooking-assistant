import React from "react";

import { AppHeader } from "components/layout/AppHeader";
import { BottomNav } from "components/layout/BottomNav";
import { ScrollToTopButton } from "components/layout/ScrollToTopButton";

import styles from "./AppShell.module.scss";

interface AppShellProps {
    children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => (
    <div className={styles["app-shell"]}>
        <AppHeader />
        <main className={styles["app-shell__main"]}>{children}</main>
        <ScrollToTopButton />
        <BottomNav />
    </div>
);
