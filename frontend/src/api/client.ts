import type {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import i18next from "i18next";
export { isAxiosError } from "axios";

import { API_BASE_URL } from "config/env";
import {
    HTTP_STATUS_FORBIDDEN,
    HTTP_STATUS_UNAUTHORIZED,
} from "constants/http";
import { DEFAULT_LOCALE } from "constants/locales";
import { PUBLIC_PATHS } from "constants/routes";

import { stripLocale } from "utils/localePath";
import { matchRoutePattern } from "utils/matchRoutePattern";

import { API_ROUTES } from "./endpoints";
import { redirectToLogin } from "./redirect";

export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const AUTH_ERROR_STATUSES = [HTTP_STATUS_UNAUTHORIZED, HTTP_STATUS_FORBIDDEN];
// change-password's 401 means "wrong current password", a normal in-band form error the modal already shows inline - not an expired session
const SKIP_REDIRECT_URLS = [API_ROUTES.auth.me, API_ROUTES.auth.changePassword];

export function handleAuthError(error: AxiosError): Promise<never> {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";
    const isAuthError =
        typeof status === "number" && AUTH_ERROR_STATUSES.includes(status);
    const isSkipped = SKIP_REDIRECT_URLS.some((url) => requestUrl === url);
    const isPublicPath = PUBLIC_PATHS.some((pattern) =>
        matchRoutePattern(pattern, stripLocale(window.location.pathname)),
    );
    const isProtectedPath = !isPublicPath;

    const shouldRedirect = isAuthError && !isSkipped && isProtectedPath;

    if (shouldRedirect) {
        redirectToLogin();
    }

    return Promise.reject(error);
}

// the server writes its messages, and a new account's emails, in the language the app is showing
export function withAppLanguage(
    config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
    config.headers.set(
        "Accept-Language",
        i18next.resolvedLanguage ?? DEFAULT_LOCALE,
    );

    return config;
}

apiClient.interceptors.request.use(withAppLanguage);
apiClient.interceptors.response.use((response) => response, handleAuthError);
