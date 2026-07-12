import { Cell, Pie, PieChart as RechartsPieChart, Tooltip } from "recharts";

import { getChartColor } from "./chartColors";
import {
    PIE_CURSOR,
    PIE_DATA_KEY,
    PIE_NAME_KEY,
    PIE_SIZE,
    TOOLTIP_CONTENT_STYLE,
    TOOLTIP_WRAPPER_STYLE,
} from "./chartStyles";
import styles from "./PieChartCard.module.scss";

export interface PieChartDatum {
    name: string;
    value: number;
}

interface PieChartCardProps {
    data: PieChartDatum[];
    centerLabel: string;
}

const PieChartCard = ({ data, centerLabel }: PieChartCardProps) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className={styles["pie-chart-card"]}>
            <div
                role="presentation"
                className={styles["pie-chart-card__pie-wrapper"]}
                style={{ width: PIE_SIZE, height: PIE_SIZE }}
                onMouseDown={(e) => {
                    e.preventDefault();
                }}
            >
                <RechartsPieChart
                    width={PIE_SIZE}
                    height={PIE_SIZE}
                    className={styles["pie-chart-card__svg"]}
                >
                    <Pie
                        data={data}
                        dataKey={PIE_DATA_KEY}
                        nameKey={PIE_NAME_KEY}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={64}
                        paddingAngle={2}
                        strokeWidth={0}
                        cursor={PIE_CURSOR}
                        isAnimationActive={false}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={entry.name}
                                fill={getChartColor(index)}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={TOOLTIP_CONTENT_STYLE}
                        wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                    />
                </RechartsPieChart>
                <div
                    aria-hidden="true"
                    className={styles["pie-chart-card__center"]}
                >
                    <span className={styles["pie-chart-card__center-total"]}>
                        {total}
                    </span>
                    <span className={styles["pie-chart-card__center-label"]}>
                        {centerLabel}
                    </span>
                </div>
            </div>
            <div className={styles["pie-chart-card__legend"]}>
                {data.map((entry, index) => (
                    <div
                        key={entry.name}
                        className={styles["pie-chart-card__legend-item"]}
                    >
                        <span
                            className={styles["pie-chart-card__legend-dot"]}
                            style={{ backgroundColor: getChartColor(index) }}
                        />
                        <span className={styles["pie-chart-card__legend-name"]}>
                            {entry.name}
                        </span>
                        <span
                            className={styles["pie-chart-card__legend-value"]}
                        >
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieChartCard;
