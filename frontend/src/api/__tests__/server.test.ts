import { fetchAsVisitor, fetchPublic } from "api/server";

import {
    resetTestRequest,
    setTestCookies,
    setTestRequestHeaders,
} from "test/nextHeadersMock";

const PATH = "/api/recipe/1";
const SESSION_COOKIE = "authToken=abc";
const PAYLOAD = { id: 1 };

const mockFetch = jest.fn();

const respondWith = (status: number, body: unknown = PAYLOAD) => {
    mockFetch.mockResolvedValue({
        status,
        ok: status < 400,
        json: () => Promise.resolve(body),
    });
};

const lastInit = (): RequestInit => {
    const [[, init]] = mockFetch.mock.calls as [[string, RequestInit]];

    return init;
};

const lastHeaders = (): Record<string, string> =>
    lastInit().headers as Record<string, string>;

describe("server api", () => {
    beforeEach(() => {
        resetTestRequest();
        global.fetch = mockFetch;
    });

    it("should forward the session cookie and nothing else the browser holds", async () => {
        setTestCookies({ authToken: "abc", theme: "dark" });
        setTestRequestHeaders({ "x-forwarded-for": "203.0.113.9" });
        respondWith(200);

        await fetchAsVisitor(PATH, "en");

        expect(lastHeaders()).toEqual({
            "accept-language": "en",
            cookie: SESSION_COOKIE,
            "x-forwarded-for": "203.0.113.9",
        });
    });

    it("should send no cookie header when the visitor has no session", async () => {
        respondWith(200);

        await fetchAsVisitor(PATH, "en");

        expect(lastHeaders()).toEqual({ "accept-language": "en" });
    });

    it("should ask the api for any copy in the page's language", async () => {
        respondWith(200);

        await fetchAsVisitor(PATH, "uk");

        expect(lastHeaders()["accept-language"]).toBe("uk");
    });

    it("should never store a response assembled for one visitor", async () => {
        respondWith(200);

        await fetchAsVisitor(PATH, "en");

        expect(lastInit().cache).toBe("no-store");
    });

    it("should give up on a request the api does not answer in time", async () => {
        respondWith(200);

        await fetchAsVisitor(PATH, "en");

        expect(lastInit().signal).toBeInstanceOf(AbortSignal);
    });

    it("should return the parsed payload", async () => {
        respondWith(200);

        await expect(fetchAsVisitor(PATH, "en")).resolves.toEqual(PAYLOAD);
    });

    it("should return null when the resource does not exist", async () => {
        respondWith(404, null);

        await expect(fetchAsVisitor(PATH, "en")).resolves.toBeNull();
    });

    it("should throw when the api answers with a failure", async () => {
        respondWith(500, null);

        await expect(fetchAsVisitor(PATH, "en")).rejects.toThrow(
            "answered 500",
        );
    });

    it("should carry no session on a public request and allow it to be reused", async () => {
        setTestCookies({ authToken: "abc", theme: "dark" });
        respondWith(200);

        await fetchPublic(PATH, 3600);

        expect(lastInit().headers).toBeUndefined();
        expect(lastInit().next).toEqual({ revalidate: 3600 });
    });
});
