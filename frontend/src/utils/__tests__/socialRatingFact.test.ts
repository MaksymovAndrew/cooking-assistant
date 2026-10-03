import i18next from "i18next";

import { socialRatingFact } from "utils/socialRatingFact";

const t = i18next.getFixedT("en", "common");

describe("socialRatingFact", () => {
    it("should state nothing for a record nobody has rated", () => {
        expect(
            socialRatingFact({ ratingAverage: null, ratingCount: 0 }, t, "en"),
        ).toBeNull();
    });

    it("should state the one-decimal average and the vote count", () => {
        expect(
            socialRatingFact({ ratingAverage: 4, ratingCount: 3 }, t, "en"),
        ).toBe("Rated 4.0 from 3 votes");
    });

    it("should use the singular for a single vote", () => {
        expect(
            socialRatingFact({ ratingAverage: 5, ratingCount: 1 }, t, "en"),
        ).toBe("Rated 5.0 from 1 vote");
    });

    it("should format the average in the page's language", () => {
        expect(
            socialRatingFact({ ratingAverage: 4.5, ratingCount: 2 }, t, "pl"),
        ).toContain("4,5");
    });
});
