// manual mock for src/api/client.ts - activated by a bare jest.mock("../client") in api tests; the handles are exposed typed via src/test/apiClientMock.ts
export const apiClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
};
