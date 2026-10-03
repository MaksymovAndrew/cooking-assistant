import { apiClient } from "api/client";

// typed handles onto api/__mocks__/client.ts, live once a test calls jest.mock("api/client")
const mockedClient = jest.mocked(apiClient);

export const mockedGet = mockedClient.get;
export const mockedPost = mockedClient.post;
export const mockedPut = mockedClient.put;
export const mockedPatch = mockedClient.patch;
export const mockedDelete = mockedClient.delete;

// an unmapped url rejects, so a forgotten stub fails loudly instead of hanging
export const mockGetByUrl = (handlers: Record<string, unknown>) => {
    mockedGet.mockImplementation((url: string) =>
        url in handlers
            ? Promise.resolve({ data: handlers[url] })
            : Promise.reject(new Error(`unexpected GET ${url}`)),
    );
};

export const byOffset = (config: unknown): number =>
    (config as { params?: { offset?: number } } | null)?.params?.offset ?? 0;

export const makeAxiosError = (status: number, message: string): Error =>
    Object.assign(new Error(message), {
        isAxiosError: true,
        response: { status, data: { error: message } },
    });
