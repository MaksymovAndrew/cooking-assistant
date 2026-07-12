import type { CurrentUser, LoginRequest, RegisterRequest } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";

// getMe provides the Me tag; login/logout invalidate it so the session check (sessionSlice listens to these endpoints) re-runs after auth changes
export const authApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getMe: build.query<CurrentUser, null>({
            query: () => ({ url: API_ROUTES.auth.me }),
            providesTags: ["Me"],
        }),
        login: build.mutation<null, LoginRequest>({
            query: (credentials) => ({
                url: API_ROUTES.auth.login,
                method: "POST",
                data: credentials,
            }),
            invalidatesTags: ["Me"],
        }),
        register: build.mutation<null, RegisterRequest>({
            query: (data) => ({
                url: API_ROUTES.auth.register,
                method: "POST",
                data,
            }),
        }),
        logout: build.mutation<null, null>({
            query: () => ({ url: API_ROUTES.auth.logout, method: "POST" }),
            invalidatesTags: ["Me"],
        }),
    }),
});

export const {
    useGetMeQuery,
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
} = authApi;
