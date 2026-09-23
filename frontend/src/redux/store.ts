import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { notificationsListener } from "redux/middleware/notificationsListener";
import { baseApi } from "redux/services/baseApi";
import { emailVerificationReducer } from "redux/slices/emailVerificationSlice";
import { notificationsReducer } from "redux/slices/notificationsSlice";
import { sessionReducer, type SessionStatus } from "redux/slices/sessionSlice";
import { getInitialThemeMode, themeReducer } from "redux/slices/themeSlice";
import { uiReducer } from "redux/slices/uiSlice";

const rootReducer = combineReducers({
    session: sessionReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
    theme: themeReducer,
    emailVerification: emailVerificationReducer,
    [baseApi.reducerPath]: baseApi.reducer,
});

// inferred from the reducer itself, so the type never drifts from the real shape
export type RootState = ReturnType<typeof rootReducer>;

// one factory used by both the real store and tests, so a test store can never drift from the production wiring (the RTK Query middleware powers the cache)
export const setupStore = (preloadedState?: Partial<RootState>) =>
    configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware()
                .prepend(notificationsListener.middleware)
                .concat(baseApi.middleware),
        preloadedState,
    });

// one store per render tree, never a module-level singleton: on a server render a shared
// store would carry one request's state into the next. The browser resolves the theme
// here, so the very first render already paints the right one.
export const createStore = (sessionStatus: SessionStatus) =>
    typeof window === "undefined"
        ? setupStore({ session: { status: sessionStatus } })
        : setupStore({
              session: { status: sessionStatus },
              theme: { mode: getInitialThemeMode() },
          });

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
