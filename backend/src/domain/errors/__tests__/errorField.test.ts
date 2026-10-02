import { errorField } from "domain/errors/errorField";

describe("errorField", () => {
    it("should read a field the thrown value carries", () => {
        const error = Object.assign(new Error("duplicate"), { code: "23505" });

        expect(errorField(error, "code")).toBe("23505");
    });

    it("should read a field off a plain object, as a driver may throw one", () => {
        expect(errorField({ status: 413 }, "status")).toBe(413);
    });

    it.each([["boom"], [null], [undefined], [42]])(
        "should answer undefined for a thrown %p",
        (thrown) => {
            expect(errorField(thrown, "code")).toBeUndefined();
        },
    );

    it("should answer undefined for a field the value does not have", () => {
        expect(errorField(new Error("plain"), "code")).toBeUndefined();
    });
});
