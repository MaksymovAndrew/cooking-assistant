import type { StatListItem } from "components/stats/TwoColumnStatList";

export const EXTREME_LIST_LIMIT = 3;

interface ExtremeRecord {
    id: number;
    title: string;
}

// the top few records of one extreme, each row linking to the record it describes
export const extremeItems = <T extends ExtremeRecord>(
    records: T[],
    value: (record: T) => string,
    href: (id: number) => string,
): StatListItem[] =>
    records.slice(0, EXTREME_LIST_LIMIT).map((record) => ({
        key: record.id,
        name: record.title,
        value: value(record),
        href: href(record.id),
    }));
