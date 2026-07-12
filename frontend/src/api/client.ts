import type { AxiosError, AxiosInstance } from "axios";
import axios from "axios";
export { isAxiosError } from "axios";

import { API_BASE_URL } from "config/env";
import {
    HTTP_STATUS_FORBIDDEN,
    HTTP_STATUS_UNAUTHORIZED,
} from "constants/http";
import { PUBLIC_PATHS } from "constants/routes";

import { API_ROUTES } from "./endpoints";
import { redirectToLogin } from "./redirect";

export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const AUTH_ERROR_STATUSES = [HTTP_STATUS_UNAUTHORIZED, HTTP_STATUS_FORBIDDEN];
const SKIP_REDIRECT_URLS = [API_ROUTES.auth.me];

export function handleAuthError(error: AxiosError): Promise<never> {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";
    const isAuthError =
        typeof status === "number" && AUTH_ERROR_STATUSES.includes(status);
    const isSkipped = SKIP_REDIRECT_URLS.some((url) => requestUrl === url);
    const isProtectedPath = !PUBLIC_PATHS.includes(window.location.pathname);

    const shouldRedirect = isAuthError && !isSkipped && isProtectedPath;

    if (shouldRedirect) {
        redirectToLogin();
    }

    return Promise.reject(error);
}

apiClient.interceptors.response.use((response) => response, handleAuthError);
