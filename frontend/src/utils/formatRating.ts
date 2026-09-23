// one decimal everywhere a rating is printed, so 4 reads "4.0" beside a "4.5"
export const formatRatingAverage = (average: number): string =>
    average.toFixed(1);
