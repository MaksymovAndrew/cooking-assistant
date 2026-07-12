// purple / blue / amber / teal - shared by every chart on the stats page
export const STATS_PALETTE: string[] = [
    "#7E60BF",
    "#4FA3D9",
    "#E0A33E",
    "#3FA98E",
];

export const getChartColor = (index: number): string =>
    STATS_PALETTE[index % STATS_PALETTE.length];
