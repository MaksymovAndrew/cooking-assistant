// picked up by a bare jest.mock of api/client; test/apiClientMock.ts exposes it typed
export const apiClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
};
