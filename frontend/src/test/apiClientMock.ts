import { apiClient } from "api/client";

// typed handles onto the manual client mock (src/api/__mocks__/client.ts); a test only needs jest.mock("../client") for these to point at the mock
const mockedClient = jest.mocked(apiClient);

export const mockedGet = mockedClient.get;
export const mockedPost = mockedClient.post;
export const mockedPut = mockedClient.put;
export const mockedDelete = mockedClient.delete;

// resolve GET requests by url, for pages that hit several endpoints at once; an unmapped url rejects so a forgotten stub fails loudly instead of hanging
export const mockGetByUrl = (handlers: Record<string, unknown>) => {
    mockedGet.mockImplementation((url: string) =>
        url in handlers
            ? Promise.resolve({ data: handlers[url] })
            : Promise.reject(new Error(`unexpected GET ${url}`)),
    );
};

// the offset an infiniteQuery request asked for, read off the axios config passed to apiClient.get(url, { params })
export const byOffset = (config: unknown): number =>
    (config as { params?: { offset?: number } } | null)?.params?.offset ?? 0;

// a fake axios error recognized by axios.isAxiosError, for tests that mock a failed GET/POST/PUT/DELETE through the api client
export const makeAxiosError = (status: number, message: string): Error =>
    Object.assign(new Error(message), {
        isAxiosError: true,
        response: { status, data: { error: message } },
    });
