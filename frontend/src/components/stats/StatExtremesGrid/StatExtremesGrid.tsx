import React from "react";
import { useTranslation } from "react-i18next";

import { StatCard } from "components/stats/StatCard";
import type {
    StatListItem,
    StatListTone,
} from "components/stats/TwoColumnStatList";
import { TwoColumnStatList } from "components/stats/TwoColumnStatList";

import styles from "./StatExtremesGrid.module.scss";

interface ColumnLook {
    labelKey:
        | "statsPage.fastest"
        | "statsPage.slowest"
        | "statsPage.most"
        | "statsPage.least";
    tone: StatListTone;
}

// every extremes card compares one of two fixed pairs, so a caller names the pair, not its looks
const COLUMN_PAIRS = {
    time: [
        { labelKey: "statsPage.fastest", tone: "success" },
        { labelKey: "statsPage.slowest", tone: "warning" },
    ],
    amount: [
        { labelKey: "statsPage.most", tone: "brand" },
        { labelKey: "statsPage.least", tone: "muted" },
    ],
} satisfies Record<string, [ColumnLook, ColumnLook]>;

export interface ExtremeCardSpec {
    heading: string;
    pair: keyof typeof COLUMN_PAIRS;
    columns: [StatListItem[], StatListItem[]];
}

interface StatExtremesGridProps {
    cards: ExtremeCardSpec[];
}

export const StatExtremesGrid: React.FC<StatExtremesGridProps> = ({
    cards,
}) => {
    const { t } = useTranslation("stats");

    return (
        <div className={styles["stat-extremes-grid"]}>
            {cards.map(({ heading, pair, columns }) => {
                const [left, right] = COLUMN_PAIRS[pair].map((look, i) => ({
                    label: t(look.labelKey),
                    tone: look.tone,
                    items: columns[i],
                }));

                return (
                    <StatCard key={heading}>
                        <h2 className={styles["stat-extremes-grid__title"]}>
                            {heading}
                        </h2>
                        <TwoColumnStatList left={left} right={right} />
                    </StatCard>
                );
            })}
        </div>
    );
};
