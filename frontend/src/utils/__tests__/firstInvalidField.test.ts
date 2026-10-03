import { firstInvalidField } from "utils/firstInvalidField";

describe("firstInvalidField", () => {
    it("should find the first field marked invalid, in document order", () => {
        const form = document.createElement("form");

        form.innerHTML =
            '<input id="ok" /><input id="title" aria-invalid="true" /><input id="time" aria-invalid="true" />';

        expect(firstInvalidField(form)?.id).toBe("title");
    });

    it("should find nothing when every field is valid", () => {
        const form = document.createElement("form");

        form.innerHTML = '<input aria-invalid="false" />';

        expect(firstInvalidField(form)).toBeNull();
    });
});
