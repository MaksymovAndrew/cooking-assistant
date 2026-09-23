import { personDisplayName, personInitials } from "utils/personName";

describe("personDisplayName", () => {
    it("should join the name and surname", () => {
        expect(
            personDisplayName({ name: "Ada", surname: "Cook", login: "ada" }),
        ).toBe("Ada Cook");
    });

    it("should fall back to the login when the surname is missing", () => {
        expect(personDisplayName({ name: "Ada", login: "ada" })).toBe("ada");
    });
});

describe("personInitials", () => {
    it("should build initials from the name and surname", () => {
        expect(personInitials({ name: "Ada", surname: "Cook" })).toBe("AC");
    });

    it("should return undefined when the name is incomplete", () => {
        expect(personInitials({ surname: "Cook" })).toBeUndefined();
    });
});
