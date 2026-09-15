import type { ErrorCode } from "constants/errorCodes";
import { translateError } from "i18n/translate";

export function errorBody(code: ErrorCode) {
    return { error: translateError(code), code };
}
