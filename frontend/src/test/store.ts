import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import React from "react";
import { Provider } from "react-redux";

import type { AppStore, RootState } from "redux/store";
import { setupStore } from "redux/store";

// fresh store per test; pass preloadedState to seed slices (session, ui, ...)
export const makeTestStore = (preloadedState?: Partial<RootState>) =>
    setupStore(preloadedState);

// renders a hook behind a real Redux Provider and returns the store alongside the render result
export const renderHookWithStore = <T>(
    callback: () => T,
    store: AppStore = makeTestStore(),
) => {
    const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(Provider, { store, children });

    return { ...renderHook(callback, { wrapper }), store };
};
