import { getUserId } from "controller/requestUser";

describe("getUserId", () => {
    it("should return the user id from the request", () => {
        const req = { user: { id: 7 } };

        expect(getUserId(req)).toBe(7);
    });

    it("should throw when req.user is missing", () => {
        const req = {};

        expect(() => getUserId(req)).toThrow("Authenticated user is missing");
    });
});
