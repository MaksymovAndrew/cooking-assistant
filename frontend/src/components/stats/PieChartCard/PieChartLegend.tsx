import styles from "./PieChartCard.module.scss";

interface PieChartLegendProps {
    data: { name: string; value: number }[];
    colors: string[];
}

export const PieChartLegend = ({ data, colors }: PieChartLegendProps) => (
    <div className={styles["pie-chart-card__legend"]}>
        {data.map((entry, index) => (
            <div
                key={entry.name}
                className={styles["pie-chart-card__legend-item"]}
            >
                <span
                    className={styles["pie-chart-card__legend-dot"]}
                    style={{ backgroundColor: colors[index] }}
                />
                <span className={styles["pie-chart-card__legend-name"]}>
                    {entry.name}
                </span>
                <span className={styles["pie-chart-card__legend-value"]}>
                    {entry.value}
                </span>
            </div>
        ))}
    </div>
);
