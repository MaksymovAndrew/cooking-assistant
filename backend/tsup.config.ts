import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        index: "src/index.ts",
        // keep scripts/ so the runner's __dirname-relative ../../migrations resolves in each bundle
        "scripts/migrate": "src/scripts/migrate.ts",
        "scripts/seed": "src/scripts/seed.ts",
        "scripts/deploy-db": "src/scripts/deploy-db.ts",
    },
    format: ["cjs"],
    target: "node24",
    platform: "node",
    bundle: true,
    sourcemap: true,
    clean: true,
    tsconfig: "tsconfig.json",
});
