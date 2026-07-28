// minimal RFC4180 parser: handles quoted fields, commas inside quotes, and "" escaped quotes
export type CsvRow = Record<string, string>;

export function parseCsv(text: string): CsvRow[] {
    const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
    const header = splitCsvLine(lines[0]);
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = splitCsvLine(lines[i]);
        const row: CsvRow = {};

        header.forEach((column, index) => {
            row[column] = values[index] ?? "";
        });
        rows.push(row);
    }

    return rows;
}

function splitCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (inQuotes) {
            if (char === '"' && line[i + 1] === '"') {
                current += '"';
                i++;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                current += char;
            }
        } else if (char === '"') {
            inQuotes = true;
        } else if (char === ",") {
            values.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    values.push(current);

    return values;
}
