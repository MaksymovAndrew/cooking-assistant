import type { BaseQueryFn } from "@reduxjs/toolkit/query";

import { apiClient } from "api/client";
import {
    getApiErrorMessage,
    getApiErrorRetryAfter,
    getApiErrorStatus,
} from "api/httpError";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface AxiosBaseQueryArgs {
    url: string;
    method?: HttpMethod;
    data?: unknown;
    params?: unknown;
}

export interface AxiosBaseQueryError {
    status?: number;
    data: string;
    retryAfter: number | null;
}

export type AxiosBaseQueryFn = BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    AxiosBaseQueryError
>;

interface RunRequestArgs {
    url: string;
    method: HttpMethod;
    data?: unknown;
    params?: unknown;
}

// maps the HTTP verb to the matching client method (the manual test mock only
// stubs the named methods, so we never call the instance as a function); keying
// by HttpMethod keeps the map exhaustive - adding a verb to the union fails to
// compile until it is handled here
const requestByMethod = {
    GET: ({ url, params }: RunRequestArgs) =>
        apiClient.get<unknown>(url, { params }),
    POST: ({ url, data }: RunRequestArgs) => apiClient.post<unknown>(url, data),
    PUT: ({ url, data }: RunRequestArgs) => apiClient.put<unknown>(url, data),
    DELETE: ({ url, params }: RunRequestArgs) =>
        apiClient.delete<unknown>(url, { params }),
} satisfies Record<HttpMethod, (args: RunRequestArgs) => Promise<unknown>>;

const runRequest = (args: RunRequestArgs) => requestByMethod[args.method](args);

// RTK Query baseQuery on top of apiClient: success -> { data }, failure ->
// { error: { status, data } } with a user-facing message from getApiErrorMessage
export const axiosBaseQuery =
    (): AxiosBaseQueryFn =>
    async ({ url, method = "GET", data, params }) => {
        try {
            const response = await runRequest({ url, method, data, params });

            return { data: response.data };
        } catch (error: unknown) {
            return {
                error: {
                    status: getApiErrorStatus(error),
                    data: getApiErrorMessage(error),
                    retryAfter: getApiErrorRetryAfter(error),
                },
            };
        }
    };
