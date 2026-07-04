import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import type { AppStore } from "redux/store";

import { makeTestStore } from "test/store";

// shared navigate spy for tests that partially mock react-router-dom's
// useNavigate (the jest.mock call itself stays in each file due to hoisting)
export const mockNavigate = jest.fn();

interface RenderOptions {
    // neutral non-root default: SearchComponent infinite-loops at pathname "/"
    initialEntries?: string[];
    store?: AppStore;
}

// use when a test needs the store (seed preloadedState / assert dispatched effects)
export const renderWithProviders = (
    ui: ReactElement,
    { initialEntries = ["/test"], store = makeTestStore() }: RenderOptions = {},
) => {
    const view = render(
        <Provider store={store}>
            <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
        </Provider>,
    );

    return { store, ...view };
};

// backward-compatible: existing call sites pass (ui) or (ui, initialEntries)
export const renderWithRouter = (
    ui: ReactElement,
    initialEntries: string[] = ["/test"],
) => renderWithProviders(ui, { initialEntries });
