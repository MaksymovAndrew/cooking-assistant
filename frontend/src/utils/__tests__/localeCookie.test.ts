import { readLocaleCookie, writeLocaleCookie } from "utils/localeCookie";

const clearCookie = () => {
    document.cookie = "NEXT_LOCALE=; Path=/; Max-Age=0";
};

describe("localeCookie", () => {
    afterEach(clearCookie);

    it("should read back the language it wrote", () => {
        writeLocaleCookie("uk");

        expect(readLocaleCookie()).toBe("uk");
    });

    it("should read nothing when no language was chosen", () => {
        expect(readLocaleCookie()).toBeNull();
    });

    it("should ignore a value that is not a language", () => {
        document.cookie = "NEXT_LOCALE=xx; Path=/";

        expect(readLocaleCookie()).toBeNull();
    });
});
