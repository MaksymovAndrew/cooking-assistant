import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { Provider } from "react-redux";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import type { AppStore } from "redux/store";

import { makeTestStore } from "test/store";

// shared navigate spy for tests that partially mock react-router-dom's useNavigate (the jest.mock call itself stays in each file due to hoisting)
export const mockNavigate = jest.fn();

interface RenderOptions {
    // neutral non-root default: avoids coupling tests to whatever page currently lives at "/"
    initialEntries?: string[];
    store?: AppStore;
}

// use when a test needs the store (seed preloadedState / assert dispatched effects); a data router (not <MemoryRouter>) so useBlocker renders in tests
export const renderWithProviders = (
    ui: ReactElement,
    { initialEntries = ["/test"], store = makeTestStore() }: RenderOptions = {},
) => {
    const router = createMemoryRouter([{ path: "*", element: ui }], {
        initialEntries,
    });
    const view = render(
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>,
    );

    return { store, ...view };
};

// accepts either (ui) or (ui, initialEntries)
export const renderWithRouter = (
    ui: ReactElement,
    initialEntries: string[] = ["/test"],
) => renderWithProviders(ui, { initialEntries });
