import i18next from "i18next";

import type { NumericRangeValue } from "utils/filters/filterDefFactories.range";
import { RECIPE_RANGE_FILTER_DEFS } from "utils/filters/recipeFilterDefs.ranges";

const t = i18next.getFixedT("en", "recipes");

const chipFor = (key: string, value: NumericRangeValue): string | undefined =>
    RECIPE_RANGE_FILTER_DEFS.find((def) => def.key === key)?.chipLabel?.(
        value,
        t,
    );

describe("RECIPE_RANGE_FILTER_DEFS", () => {
    it("should keep the cooking time and calorie ranges in their own URL keys", () => {
        const [cookingTime, calories] = RECIPE_RANGE_FILTER_DEFS;
        const url = new URLSearchParams();

        cookingTime.write(url, { min: "10", max: "30" });
        calories.write(url, { min: "200", max: "" });

        expect(url.toString()).toBe("time_min=10&time_max=30&kcal_min=200");
    });

    it.each([
        ["cookingTime", { min: "10", max: "30" }, "10–30 min"],
        ["cookingTime", { min: "10", max: "" }, "From 10 min"],
        ["cookingTime", { min: "", max: "30" }, "Up to 30 min"],
        ["calories", { min: "200", max: "500" }, "200–500 kcal"],
        ["calories", { min: "200", max: "" }, "From 200 kcal"],
        ["calories", { min: "", max: "500" }, "Up to 500 kcal"],
    ])("should label the %s range %j as %s", (key, value, label) => {
        expect(chipFor(key, value)).toBe(label);
    });

    it("should label an inverted range by the lower bound the request keeps", () => {
        expect(chipFor("cookingTime", { min: "60", max: "15" })).toBe(
            "From 60 min",
        );
    });
});
