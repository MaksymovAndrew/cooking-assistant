import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart as RechartsPieChart, Tooltip } from "recharts";

import { getChartColor } from "./chartColors";
import {
    CENTER_LABEL_STYLE,
    CENTER_STYLE,
    CENTER_TOTAL_STYLE,
    LEGEND_DOT_BASE_STYLE,
    LEGEND_ITEM_STYLE,
    LEGEND_WRAPPER_STYLE,
    PIE_CURSOR,
    PIE_DATA_KEY,
    PIE_NAME_KEY,
    PIE_SIZE,
    PIE_WRAPPER_STYLE,
    RECHARTS_SVG_STYLE,
    TOOLTIP_CONTENT_STYLE,
    TOOLTIP_WRAPPER_STYLE,
} from "./chartStyles";

export interface PieChartDatum {
    name: string;
    value: number;
}

interface PieChartCardProps {
    data: PieChartDatum[];
    centerLabel: string;
}

const PieChartCard = ({ data, centerLabel }: PieChartCardProps) => {
    const { t } = useTranslation("stats");
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div>
            <div
                role="presentation"
                style={PIE_WRAPPER_STYLE}
                onMouseDown={(e) => {
                    e.preventDefault();
                }}
            >
                <RechartsPieChart
                    width={PIE_SIZE}
                    height={PIE_SIZE}
                    style={RECHARTS_SVG_STYLE}
                >
                    <Pie
                        data={data}
                        dataKey={PIE_DATA_KEY}
                        nameKey={PIE_NAME_KEY}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        strokeWidth={0}
                        cursor={PIE_CURSOR}
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
                <div aria-hidden="true" style={CENTER_STYLE}>
                    <span style={CENTER_TOTAL_STYLE}>{total}</span>
                    <span style={CENTER_LABEL_STYLE}>{centerLabel}</span>
                </div>
            </div>
            <div style={LEGEND_WRAPPER_STYLE}>
                {data.map((entry, index) => (
                    <div key={entry.name} style={LEGEND_ITEM_STYLE}>
                        <span
                            style={{
                                ...LEGEND_DOT_BASE_STYLE,
                                backgroundColor: getChartColor(index),
                            }}
                        />
                        <span>
                            {t("statsPage.legendEntry", {
                                name: entry.name,
                                count: entry.value,
                            })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieChartCard;
