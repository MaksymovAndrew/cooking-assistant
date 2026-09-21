import type { TFunction } from "i18next";

import type { RecordRating } from "types/rating";

import { formatRatingAverage } from "utils/formatRating";

// t is bound to the "common" namespace; an unrated record states nothing rather than a zero
export const socialRatingFact = (
    {
        ratingAverage,
        ratingCount,
    }: Pick<RecordRating, "ratingAverage" | "ratingCount">,
    t: TFunction,
): string | null =>
    ratingAverage === null
        ? null
        : t("social.rating", {
              average: formatRatingAverage(ratingAverage),
              count: ratingCount,
          });
