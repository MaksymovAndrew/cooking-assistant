import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { Provider } from "react-redux";

import type { AppStore } from "redux/store";

import { NavigationBlockerProvider } from "components/layout/NavigationBlocker";

import { setTestLocation } from "test/nextNavigationMock";
import { makeTestStore } from "test/store";

export { mockNavigate, setTestParams } from "test/nextNavigationMock";

interface RenderOptions {
    initialEntries?: string[];
    store?: AppStore;
}

// the navigation blocker is app-wide, so guarded links and forms behave here too
export const renderWithProviders = (
    ui: ReactElement,
    { initialEntries = ["/test"], store = makeTestStore() }: RenderOptions = {},
) => {
    setTestLocation(initialEntries[0]);

    const view = render(
        <Provider store={store}>
            <NavigationBlockerProvider>{ui}</NavigationBlockerProvider>
        </Provider>,
    );

    return { store, ...view };
};

export const renderWithRouter = (
    ui: ReactElement,
    initialEntries: string[] = ["/test"],
) => renderWithProviders(ui, { initialEntries });
