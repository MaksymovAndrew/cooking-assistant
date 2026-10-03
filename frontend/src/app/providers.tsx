"use client";

import { setupListeners } from "@reduxjs/toolkit/query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";

import { APP_ROOT_ID } from "constants/landmarks";
import type { Locale } from "constants/locales";

import type { SessionStatus } from "redux/slices/sessionSlice";
import { createStore } from "redux/store";

import { useOfflineNotice } from "hooks/useOfflineNotice";

import { NavigationBlockerProvider } from "components/layout/NavigationBlocker";
import { ModalRoot } from "components/modals";
import { ThemeManager } from "components/theme/ThemeManager";
import { Toaster } from "components/ui/Toasts";
import { createAppI18n } from "i18n/createAppI18n";
import type { Resources } from "i18n/resources";

import styles from "./providers.module.scss";

interface ProvidersProps {
    children: ReactNode;
}

interface RootProvidersProps extends ProvidersProps {
    initialSessionStatus: SessionStatus;
    locale: Locale;
    // the page's own language only: the others never reach the browser
    resources: Resources;
}

// app-wide behaviour, inside the providers because every piece of it needs the store
const AppRuntime = ({ children }: ProvidersProps) => {
    useOfflineNotice();

    return (
        <>
            <ThemeManager />
            <div id={APP_ROOT_ID} className={styles["app-root"]}>
                {children}
            </div>
            <ModalRoot />
            <Toaster />
        </>
    );
};

export const Providers = ({
    children,
    initialSessionStatus,
    locale,
    resources,
}: RootProvidersProps) => {
    const [store] = useState(() => createStore(initialSessionStatus));
    const [i18n] = useState(() => createAppI18n(locale, resources));

    // enables refetchOnFocus / refetchOnReconnect
    useEffect(() => setupListeners(store.dispatch), [store]);

    return (
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <NavigationBlockerProvider>
                    <AppRuntime>{children}</AppRuntime>
                </NavigationBlockerProvider>
            </I18nextProvider>
        </Provider>
    );
};
