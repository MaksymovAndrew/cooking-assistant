import "styles/global.scss";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";

import { store } from "redux/store";

import i18n from "i18n/index";

import App from "./App.tsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element not found");
}

// set before the first paint so the correct theme never flashes on load; ThemeManager takes over from here for subsequent changes
document.documentElement.dataset.theme = store.getState().theme.mode;

createRoot(rootElement).render(
    <StrictMode>
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <App />
            </I18nextProvider>
        </Provider>
    </StrictMode>,
);
