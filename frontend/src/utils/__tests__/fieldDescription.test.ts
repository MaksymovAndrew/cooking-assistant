import { joinDescribedBy } from "utils/fieldDescription";

describe("joinDescribedBy", () => {
    it("should join the ids that apply with a space", () => {
        expect(joinDescribedBy("title-hint", null, "title-error")).toBe(
            "title-hint title-error",
        );
    });

    it("should return undefined when no id applies", () => {
        expect(joinDescribedBy(null, undefined, "")).toBeUndefined();
    });
});
