import { useSyncExternalStore } from "react";

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

// real state: a hook built on the URL is only tested if writing to it re-renders the reader
export const setTestLocation = (url: string): void => {
    currentUrl = url;
    // the api layer and the login redirect read window.location, so it must agree with the mock
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

// async like the real router, which updates the URL hooks only once the transition lands
const navigate = (href: string) => {
    mockNavigate(href);
    queueMicrotask(() => {
        setTestLocation(href);
    });
};

export const mockRefresh = jest.fn();

// one stable instance, like the real router: a new one per render would re-fire dependent effects
const router = {
    push: navigate,
    replace: navigate,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: mockRefresh,
    prefetch: jest.fn(),
};

export const useRouter = () => router;

// the real one throws to stop the render; one that returned would let a page render past it
export const notFound = jest.fn((): never => {
    throw new Error("NEXT_NOT_FOUND");
});
export const redirect = jest.fn();

// the real one re-throws only Next's control-flow errors, which no test throws
export const unstable_rethrow = (): void => undefined;
