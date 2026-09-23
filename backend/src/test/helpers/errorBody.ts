import type { ErrorCode } from "constants/errorCodes";
import { DEFAULT_LOCALE } from "constants/locales";
import { translateError } from "i18n/translate";

export function errorBody(code: ErrorCode) {
    return { error: translateError(code, DEFAULT_LOCALE), code };
}
