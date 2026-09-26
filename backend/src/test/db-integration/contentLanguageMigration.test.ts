import { readFileSync } from "node:fs";
import path from "node:path";
import type { Pool, PoolClient } from "pg";

import { createTestPool } from "./testPool";

const MIGRATION_PATH = path.resolve(
    __dirname,
    "../../../migrations/1790210000000_content-language.sql",
);

// the backfill UPDATEs from the Up section, run as written
function readBackfillStatements(): string[] {
    const upSection = readFileSync(MIGRATION_PATH, "utf8").split(
        "-- Down Migration",
    )[0];

    return upSection
        .split(";")
        .map((statement) =>
            statement
                .split("\n")
                .filter((line) => !line.trim().startsWith("--"))
                .join("\n")
                .trim(),
        )
        .filter((statement) => statement.startsWith("UPDATE"));
}

describe("content-language migration backfill (real Postgres)", () => {
    let pool: Pool;
    let client: PoolClient;

    beforeAll(async () => {
        pool = createTestPool();
        client = await pool.connect();
        // temp tables shadow the real ones for this session only, so other test files never see the rewrite
        await client.query(
            `CREATE TEMP TABLE recipes (title TEXT, content TEXT, language TEXT NOT NULL DEFAULT 'en')`,
        );
        await client.query(
            `CREATE TEMP TABLE menu (menu_title TEXT, menu_content TEXT, language TEXT NOT NULL DEFAULT 'en')`,
        );
    });

    afterAll(async () => {
        client.release();
        await pool.end();
    });

    it("should detect each recipe's language from its title and content", async () => {
        await client.query(
            `INSERT INTO recipes (title, content) VALUES
                ('Tomato soup', 'Simmer for ten minutes.'),
                ('Борщ', 'Подавати гарячим із сметаною.'),
                ('Борщ со сметаной', 'Варить на медленном огне.'),
                ('Żurek na zakwasie', 'Gotować powoli.'),
                ('Pierogi', 'Dodać sól i pieprz, podawać z cebulą.')`,
        );

        for (const statement of readBackfillStatements()) {
            await client.query(statement);
        }

        const result = await client.query<{ title: string; language: string }>(
            `SELECT title, language FROM recipes ORDER BY title COLLATE "C"`,
        );

        expect(result.rows).toEqual([
            { title: "Pierogi", language: "pl" },
            { title: "Tomato soup", language: "en" },
            { title: "Żurek na zakwasie", language: "pl" },
            { title: "Борщ", language: "uk" },
            { title: "Борщ со сметаной", language: "ru" },
        ]);
    });

    it("should detect a menu's language even when it has no content", async () => {
        await client.query(
            `INSERT INTO menu (menu_title, menu_content) VALUES
                ('Weekly plan', NULL),
                ('Śniadanie na weekend', NULL),
                ('Меню на тиждень', 'Легкі страви.'),
                ('Меню на неделю', NULL)`,
        );

        for (const statement of readBackfillStatements()) {
            await client.query(statement);
        }

        const result = await client.query<{
            menu_title: string;
            language: string;
        }>(
            `SELECT menu_title, language FROM menu ORDER BY menu_title COLLATE "C"`,
        );

        expect(result.rows).toEqual([
            { menu_title: "Weekly plan", language: "en" },
            { menu_title: "Śniadanie na weekend", language: "pl" },
            { menu_title: "Меню на неделю", language: "ru" },
            { menu_title: "Меню на тиждень", language: "uk" },
        ]);
    });
});
