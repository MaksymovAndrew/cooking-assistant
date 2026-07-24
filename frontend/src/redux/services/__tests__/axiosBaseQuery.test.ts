import { configureStore } from "@reduxjs/toolkit";
import { createApi } from "@reduxjs/toolkit/query/react";

import type { AxiosBaseQueryArgs } from "redux/services/axiosBaseQuery";
import { axiosBaseQuery } from "redux/services/axiosBaseQuery";

import {
    mockedDelete,
    mockedGet,
    mockedPatch,
    mockedPost,
    mockedPut,
} from "test/apiClientMock";

jest.mock("api/client");

const PROBE_URL = "/api/probe";
const SAMPLE_DATA = { ok: true };
const REQUEST_FAILED_MESSAGE = "Request failed";

// throwaway api just to drive axiosBaseQuery through the real RTK Query pipeline
const probeApi = createApi({
    reducerPath: "probe",
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        read: build.query<unknown, AxiosBaseQueryArgs>({
            query: (arg) => arg,
        }),
        send: build.mutation<unknown, AxiosBaseQueryArgs>({
            query: (arg) => arg,
        }),
    }),
});

const makeProbeStore = () =>
    configureStore({
        reducer: { [probeApi.reducerPath]: probeApi.reducer },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(probeApi.middleware),
    });

describe("axiosBaseQuery", () => {
    it("should return the response data on success", async () => {
        mockedGet.mockResolvedValue({ data: SAMPLE_DATA });
        const store = makeProbeStore();

        const result = await store.dispatch(
            probeApi.endpoints.read.initiate({ url: PROBE_URL }),
        );

        expect(mockedGet).toHaveBeenCalledWith(PROBE_URL, {
            params: undefined,
        });
        expect(result.data).toEqual(SAMPLE_DATA);
    });

    it("should map an axios error to its status and a user-facing message", async () => {
        mockedGet.mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 404,
                data: { error: "Not found" },
                headers: {},
            },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeProbeStore();

        const result = await store.dispatch(
            probeApi.endpoints.read.initiate({ url: PROBE_URL }),
        );

        expect(result.error).toEqual({
            status: 404,
            data: "Not found",
            retryAfter: null,
            code: null,
        });
    });

    it("should map a non-axios error to an undefined status", async () => {
        mockedGet.mockRejectedValue(new Error("network down"));
        const store = makeProbeStore();

        const result = await store.dispatch(
            probeApi.endpoints.read.initiate({ url: PROBE_URL }),
        );

        expect(result.error).toEqual({
            status: undefined,
            data: "network down",
            retryAfter: null,
            code: null,
        });
    });

    it("should surface the Retry-After header as retryAfter on a 429", async () => {
        mockedGet.mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 429,
                data: { error: "Too many" },
                headers: { "retry-after": "30" },
            },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeProbeStore();

        const result = await store.dispatch(
            probeApi.endpoints.read.initiate({ url: PROBE_URL }),
        );

        expect(result.error).toEqual({
            status: 429,
            data: "Too many",
            retryAfter: 30,
            code: null,
        });
    });

    it("should surface the server's error code on a 4xx response", async () => {
        mockedGet.mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 409,
                data: {
                    error: "Login already taken",
                    code: "LOGIN_ALREADY_TAKEN",
                },
                headers: {},
            },
            message: REQUEST_FAILED_MESSAGE,
        });
        const store = makeProbeStore();

        const result = await store.dispatch(
            probeApi.endpoints.read.initiate({ url: PROBE_URL }),
        );

        expect(result.error).toEqual({
            status: 409,
            data: "Login already taken",
            retryAfter: null,
            code: "LOGIN_ALREADY_TAKEN",
        });
    });

    it("should route a mutation through the matching http verb with the body", async () => {
        mockedPost.mockResolvedValue({ data: SAMPLE_DATA });
        const store = makeProbeStore();
        const body = { name: "x" };

        await store.dispatch(
            probeApi.endpoints.send.initiate({
                url: PROBE_URL,
                method: "POST",
                data: body,
            }),
        );

        expect(mockedPost).toHaveBeenCalledWith(PROBE_URL, body);
    });

    it("should route a PUT mutation through apiClient.put with the body", async () => {
        mockedPut.mockResolvedValue({ data: SAMPLE_DATA });
        const store = makeProbeStore();
        const body = { name: "y" };

        await store.dispatch(
            probeApi.endpoints.send.initiate({
                url: PROBE_URL,
                method: "PUT",
                data: body,
            }),
        );

        expect(mockedPut).toHaveBeenCalledWith(PROBE_URL, body);
    });

    it("should route a PATCH mutation through apiClient.patch with the body", async () => {
        mockedPatch.mockResolvedValue({ data: SAMPLE_DATA });
        const store = makeProbeStore();
        const body = { name: "z" };

        await store.dispatch(
            probeApi.endpoints.send.initiate({
                url: PROBE_URL,
                method: "PATCH",
                data: body,
            }),
        );

        expect(mockedPatch).toHaveBeenCalledWith(PROBE_URL, body);
    });

    it("should route a DELETE mutation through apiClient.delete with params", async () => {
        mockedDelete.mockResolvedValue({ data: SAMPLE_DATA });
        const store = makeProbeStore();
        const params = { id: 1 };

        await store.dispatch(
            probeApi.endpoints.send.initiate({
                url: PROBE_URL,
                method: "DELETE",
                params,
            }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(PROBE_URL, {
            data: undefined,
            params,
        });
    });

    it("should route a DELETE mutation through apiClient.delete with a body", async () => {
        mockedDelete.mockResolvedValue({ data: SAMPLE_DATA });
        const store = makeProbeStore();
        const body = { password: "secret1!" };

        await store.dispatch(
            probeApi.endpoints.send.initiate({
                url: PROBE_URL,
                method: "DELETE",
                data: body,
            }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(PROBE_URL, {
            data: body,
            params: undefined,
        });
    });

    it("should deduplicate concurrent identical queries into a single request", async () => {
        mockedGet.mockResolvedValue({ data: SAMPLE_DATA });
        const store = makeProbeStore();

        await Promise.all([
            store.dispatch(
                probeApi.endpoints.read.initiate({ url: PROBE_URL }),
            ),
            store.dispatch(
                probeApi.endpoints.read.initiate({ url: PROBE_URL }),
            ),
        ]);

        expect(mockedGet).toHaveBeenCalledTimes(1);
    });
});
