import { ERROR_CODES } from "constants/errorCodes";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "constants/media";

type ImageFileProblem =
    | typeof ERROR_CODES.MEDIA_UNSUPPORTED_TYPE
    | typeof ERROR_CODES.MEDIA_TOO_LARGE;

// the same codes the server answers with, so a rejected pick reads exactly like a rejected upload
export const imageFileProblem = (file: File): ImageFileProblem | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return ERROR_CODES.MEDIA_UNSUPPORTED_TYPE;
    }

    return file.size > MAX_IMAGE_BYTES ? ERROR_CODES.MEDIA_TOO_LARGE : null;
};
