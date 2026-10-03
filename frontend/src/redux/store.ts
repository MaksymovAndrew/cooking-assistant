import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { notificationsListener } from "redux/middleware/notificationsListener";
import { baseApi } from "redux/services/baseApi";
import { emailVerificationReducer } from "redux/slices/emailVerificationSlice";
import { notificationsReducer } from "redux/slices/notificationsSlice";
import { serverDataReducer } from "redux/slices/serverDataSlice";
import { sessionReducer, type SessionStatus } from "redux/slices/sessionSlice";
import { getInitialThemeMode, themeReducer } from "redux/slices/themeSlice";
import { uiReducer } from "redux/slices/uiSlice";

const rootReducer = combineReducers({
    session: sessionReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
    theme: themeReducer,
    emailVerification: emailVerificationReducer,
    serverData: serverDataReducer,
    [baseApi.reducerPath]: baseApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// shared with tests, so a test store never drifts from the production wiring
export const setupStore = (preloadedState?: Partial<RootState>) =>
    configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware()
                .prepend(notificationsListener.middleware)
                .concat(baseApi.middleware),
        preloadedState,
    });

// per render tree: a shared server store leaks state across requests; the browser resolves its theme here
export const createStore = (sessionStatus: SessionStatus) =>
    typeof window === "undefined"
        ? setupStore({ session: { status: sessionStatus } })
        : setupStore({
              session: { status: sessionStatus },
              theme: { mode: getInitialThemeMode() },
          });

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
