import { getInitials } from "utils/getInitials";

describe("getInitials", () => {
    it("should return the uppercased first letter of the name and surname", () => {
        expect(getInitials("claude", "cook")).toBe("CC");
    });

    it("should uppercase letters that are already capitalized", () => {
        expect(getInitials("Bob", "Baker")).toBe("BB");
    });
});
