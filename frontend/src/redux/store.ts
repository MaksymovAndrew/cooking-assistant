import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { notificationsListener } from "redux/middleware/notificationsListener";
import { baseApi } from "redux/services/baseApi";
import { emailVerificationReducer } from "redux/slices/emailVerificationSlice";
import { filtersReducer } from "redux/slices/filtersSlice";
import { notificationsReducer } from "redux/slices/notificationsSlice";
import { sessionReducer } from "redux/slices/sessionSlice";
import { themeReducer } from "redux/slices/themeSlice";
import { uiReducer } from "redux/slices/uiSlice";

const rootReducer = combineReducers({
    session: sessionReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
    filters: filtersReducer,
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

export const store = setupStore();

// enables refetchOnFocus / refetchOnReconnect for the real app store
setupListeners(store.dispatch);

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
