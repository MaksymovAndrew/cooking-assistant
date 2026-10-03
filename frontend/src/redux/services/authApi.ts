import type { Locale } from "constants/locales";
import type {
    CurrentUser,
    DeleteAccountRequest,
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest,
} from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { baseApi } from "./baseApi";

// a guest gets 200 with a null body, not a 401, so browsing public pages never fails a request
export const authApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getMe: build.query<CurrentUser | null, null>({
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
        updateProfile: build.mutation<null, UpdateProfileRequest>({
            query: (data) => ({
                url: API_ROUTES.auth.me,
                method: "PATCH",
                data,
            }),
            // skipped on error, or a refetched getMe unmounts this modal; Recipe/Menu cards show the author
            invalidatesTags: (_result, error) =>
                error ? [] : ["Me", "Recipe", "Menu"],
        }),
        // the page is reloaded in the new language right after, so nothing cached needs refreshing
        setLocale: build.mutation<null, Locale>({
            query: (locale) => ({
                url: API_ROUTES.auth.locale,
                method: "PUT",
                data: { locale },
            }),
        }),
        deleteAccount: build.mutation<null, DeleteAccountRequest>({
            query: (data) => ({
                url: API_ROUTES.auth.me,
                method: "DELETE",
                data,
            }),
            invalidatesTags: (_result, error) => (error ? [] : ["Me"]),
        }),
    }),
});

export const {
    useGetMeQuery,
    useLazyGetMeQuery,
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useUpdateProfileMutation,
    useDeleteAccountMutation,
    useSetLocaleMutation,
} = authApi;
