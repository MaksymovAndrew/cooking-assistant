import type { BaseQueryFn } from "@reduxjs/toolkit/query";

import { apiClient } from "api/client";
import {
    getApiErrorCode,
    getApiErrorMessage,
    getApiErrorRetryAfter,
    getApiErrorStatus,
} from "api/httpError";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

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
    code: string | null;
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

// keyed by HttpMethod so the map stays exhaustive - adding a verb fails to compile until handled here
const requestByMethod = {
    GET: ({ url, params }: RunRequestArgs) =>
        apiClient.get<unknown>(url, { params }),
    POST: ({ url, data }: RunRequestArgs) => apiClient.post<unknown>(url, data),
    PUT: ({ url, data }: RunRequestArgs) => apiClient.put<unknown>(url, data),
    PATCH: ({ url, data }: RunRequestArgs) =>
        apiClient.patch<unknown>(url, data),
    DELETE: ({ url, data, params }: RunRequestArgs) =>
        apiClient.delete<unknown>(url, { data, params }),
} satisfies Record<HttpMethod, (args: RunRequestArgs) => Promise<unknown>>;

const runRequest = (args: RunRequestArgs) => requestByMethod[args.method](args);

// RTK Query baseQuery on top of apiClient: success -> { data }, failure -> { error: { status, data } } with a user-facing message from getApiErrorMessage
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
                    code: getApiErrorCode(error),
                },
            };
        }
    };
