export const STATS_PALETTE: string[] = [
    "#7E60BF",
    "#4FA3D9",
    "#E0A33E",
    "#3FA98E",
];

// a bucket that is no category at all, so it never borrows a category's colour
export const NEUTRAL_CHART_COLOR = "#8E8A9B";

export const getChartColor = (index: number): string =>
    STATS_PALETTE[index % STATS_PALETTE.length];

export const datumColors = (data: { color?: string }[]): string[] =>
    data.map((datum, index) => datum.color ?? getChartColor(index));
