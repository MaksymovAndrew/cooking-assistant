import { useSyncExternalStore } from "react";

// shared navigate spy: useRouter().push and replace both record here
export const mockNavigate = jest.fn();

// neutral non-root default: avoids coupling tests to whatever page currently lives at "/"
const DEFAULT_URL = "/test";

let currentUrl: string = DEFAULT_URL;
let currentParams: Record<string, string> = {};
const listeners = new Set<() => void>();

const getUrl = () => currentUrl;

const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
};

// the URL is real state, not a fixed value: hooks built on it (useListFilters) are only
// meaningful in a test if writing to it re-renders the reader
export const setTestLocation = (url: string): void => {
    currentUrl = url;
    // window.location is read directly by the api layer and the login redirect, so the two
    // views of "where am I" must never disagree in a test
    window.history.replaceState(null, "", url);
    listeners.forEach((listener) => {
        listener();
    });
};

export const setTestParams = (params: Record<string, string>): void => {
    currentParams = params;
};

export const resetTestNavigation = (): void => {
    currentParams = {};
    setTestLocation(DEFAULT_URL);
};

const useUrl = () => useSyncExternalStore(subscribe, getUrl, getUrl);

export const usePathname = (): string => useUrl().split("?")[0];

export const useSearchParams = (): URLSearchParams =>
    new URLSearchParams(useUrl().split("?")[1] ?? "");

export const useParams = (): Record<string, string> => currentParams;

// the real router does not update useSearchParams()/usePathname() before the transition lands,
// and a mock that updates them synchronously hides every bug that depends on that gap
const navigate = (href: string) => {
    mockNavigate(href);
    queueMicrotask(() => {
        setTestLocation(href);
    });
};

// one stable instance, like the real router: a new object per render would re-fire every
// effect that depends on it
const router = {
    push: navigate,
    replace: navigate,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
};

export const useRouter = () => router;

// the real one throws to stop the render; one that returned would let a page render past it
export const notFound = jest.fn((): never => {
    throw new Error("NEXT_NOT_FOUND");
});
export const redirect = jest.fn();

// the real one re-throws Next's own control-flow errors and ignores everything else; nothing
// in a test throws one of those, so ignoring is the faithful behaviour here
export const unstable_rethrow = (): void => undefined;
