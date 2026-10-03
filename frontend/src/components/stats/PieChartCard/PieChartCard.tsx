import type { PieSectorShapeProps } from "recharts";
import { Pie, PieChart as RechartsPieChart, Sector, Tooltip } from "recharts";

import { REDUCED_MOTION_QUERY } from "constants/motion";

import { useMediaQuery } from "hooks/useMediaQuery";

import { sumBy } from "utils/sum";

import { datumColors } from "./chartColors";
import {
    PIE_CURSOR,
    PIE_DATA_KEY,
    PIE_NAME_KEY,
    PIE_SIZE,
    TOOLTIP_CONTENT_STYLE,
    TOOLTIP_WRAPPER_STYLE,
} from "./chartStyles";
import styles from "./PieChartCard.module.scss";
import { PieChartLegend } from "./PieChartLegend";

export interface PieChartDatum {
    name: string;
    value: number;
    // in place of the palette colour its position would get
    color?: string;
}

interface PieChartCardProps {
    data: PieChartDatum[];
    centerLabel: string;
}

const PieChartCard = ({ data, centerLabel }: PieChartCardProps) => {
    const total = sumBy(data, (d) => d.value);
    const colors = datumColors(data);
    // recharts animates in JS, beyond the reach of the global reduced-motion CSS rule
    const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
    // Cell is deprecated in recharts 3 in favor of a custom shape per sector - https://recharts.github.io/en-US/guide/cell
    const renderSlice = (props: PieSectorShapeProps) => (
        <Sector {...props} fill={colors[props.index]} />
    );

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
                        isAnimationActive={!prefersReducedMotion}
                        shape={renderSlice}
                    />
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
            <PieChartLegend data={data} colors={colors} />
        </div>
    );
};

export default PieChartCard;
