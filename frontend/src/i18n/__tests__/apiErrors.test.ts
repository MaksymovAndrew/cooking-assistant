import { ERROR_CODES } from "constants/errorCodes";

import common from "i18n/locales/en/common.json";

describe("apiErrors copy", () => {
    it("should have copy for every backend error code and no entry without one", () => {
        expect(new Set(Object.keys(common.apiErrors))).toEqual(
            new Set(Object.values(ERROR_CODES)),
        );
    });
});
