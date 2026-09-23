import type {
    ChangePasswordRequest,
    ConfirmEmailRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
} from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";

// password recovery and change, and email verification - the flows that prove who owns the account
export const accountSecurityApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
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
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useChangePasswordMutation,
    useRequestEmailVerificationMutation,
    useConfirmEmailMutation,
} = accountSecurityApi;
