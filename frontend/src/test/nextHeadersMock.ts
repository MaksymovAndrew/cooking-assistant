// real, writable request state, so the forwarding in api/server is exercised rather than stubbed
let requestCookies = new Map<string, string>();
let requestHeaders = new Headers();

export const setTestCookies = (init: Record<string, string>): void => {
    requestCookies = new Map(Object.entries(init));
};

export const setTestRequestHeaders = (init: Record<string, string>): void => {
    requestHeaders = new Headers(init);
};

export const resetTestRequest = (): void => {
    requestCookies = new Map();
    requestHeaders = new Headers();
};

export const cookies = () =>
    Promise.resolve({
        get: (name: string) => {
            const value = requestCookies.get(name);

            return value ? { name, value } : undefined;
        },
    });

export const headers = () => Promise.resolve(requestHeaders);
