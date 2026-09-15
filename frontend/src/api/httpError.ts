import axios from "axios";
import i18next from "i18next";

import { ERROR_CODES } from "constants/errorCodes";

interface ApiErrorBody {
    error?: string;
    code?: string;
}

const KNOWN_ERROR_CODES = new Set<string>(Object.values(ERROR_CODES));

// the code is the contract and the copy is ours: a known code renders from common.json apiErrors, and the
// server's English text is only the fallback for a code this build doesn't know yet
export function getApiErrorMessage(error: unknown): string {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
        const code = error.response?.data.code;

        if (typeof code === "string" && KNOWN_ERROR_CODES.has(code)) {
            return i18next.t(`apiErrors.${code}`);
        }

        const serverMessage = error.response?.data.error;

        if (serverMessage) {
            return serverMessage;
        }

        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return i18next.t("errors.unknown");
}

// HTTP status for the axios baseQuery; non-axios errors have no status
export function getApiErrorStatus(error: unknown): number | undefined {
    if (axios.isAxiosError(error)) {
        return error.response?.status;
    }

    return undefined;
}

// the stable machine-readable error code the backend attaches to some 4xx bodies; null when absent
export function getApiErrorCode(error: unknown): string | null {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
        return error.response?.data.code ?? null;
    }

    return null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

// Retry-After cool-down in seconds (e.g. a 429); null when absent or non-numeric
export function getApiErrorRetryAfter(error: unknown): number | null {
    if (!axios.isAxiosError(error)) {
        return null;
    }

    const headers: unknown = error.response?.headers;
    const retryAfter = isRecord(headers) ? headers["retry-after"] : null;
    const seconds = Number(retryAfter);

    return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}
