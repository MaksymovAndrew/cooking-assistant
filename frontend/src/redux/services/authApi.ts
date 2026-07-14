import type {
    ChangePasswordRequest,
    ConfirmEmailRequest,
    CurrentUser,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
} from "types/auth";

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
            invalidatesTags: ["Me"],
        }),
        logout: build.mutation<null, null>({
            query: () => ({ url: API_ROUTES.auth.logout, method: "POST" }),
            invalidatesTags: ["Me"],
        }),
        forgotPassword: build.mutation<null, ForgotPasswordRequest>({
            query: (data) => ({
                url: API_ROUTES.auth.forgotPassword,
                method: "POST",
                data,
            }),
        }),
        resetPassword: build.mutation<null, ResetPasswordRequest>({
            query: (data) => ({
                url: API_ROUTES.auth.resetPassword,
                method: "POST",
                data,
            }),
        }),
        changePassword: build.mutation<null, ChangePasswordRequest>({
            query: (data) => ({
                url: API_ROUTES.auth.changePassword,
                method: "POST",
                data,
            }),
        }),
        requestEmailVerification: build.mutation<null, null>({
            query: () => ({
                url: API_ROUTES.auth.resendVerificationEmail,
                method: "POST",
            }),
        }),
        confirmEmail: build.mutation<null, ConfirmEmailRequest>({
            query: (data) => ({
                url: API_ROUTES.auth.confirmEmail,
                method: "POST",
                data,
            }),
            invalidatesTags: ["Me"],
        }),
    }),
});

export const {
    useGetMeQuery,
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useChangePasswordMutation,
    useRequestEmailVerificationMutation,
    useConfirmEmailMutation,
} = authApi;
