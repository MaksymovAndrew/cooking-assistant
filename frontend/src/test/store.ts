import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import React from "react";
import { Provider } from "react-redux";
import type { InitialEntry } from "react-router-dom";
import { MemoryRouter } from "react-router-dom";

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

interface RenderHookWithRouterOptions {
    store?: AppStore;
    initialEntries?: InitialEntry[];
}

// same as renderHookWithStore, but also wraps in a real Router so hooks built on
// useSearchParams (e.g. useListFilters) see a stateful URL instead of a static mock
export const renderHookWithRouter = <T>(
    callback: () => T,
    {
        store = makeTestStore(),
        initialEntries = ["/test"],
    }: RenderHookWithRouterOptions = {},
) => {
    const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(Provider, {
            store,
            children: React.createElement(
                MemoryRouter,
                { initialEntries },
                children,
            ),
        });

    return { ...renderHook(callback, { wrapper }), store };
};
