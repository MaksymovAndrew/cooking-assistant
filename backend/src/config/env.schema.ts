import { z } from "zod";

// shared by the schema defaults and the production guard so the "insecure default" check can never drift from the value it is guarding against
export const DEFAULT_DB_USER = "postgres";
export const DEFAULT_DB_PASSWORD = "12345678";

function emptyToUndefined(value: unknown): unknown {
    const isEmptyInput = value == null || value === "";

    return isEmptyInput ? undefined : value;
}

const envNumberSchema = (fallback: number) =>
    z.preprocess(
        emptyToUndefined,
        z.coerce
            .number({
                error: "must be a number",
            })
            .int("must be an integer")
            .positive("must be positive")
            .default(fallback),
    );

const envStringSchema = (fallback: string) =>
    z.preprocess(emptyToUndefined, z.string().default(fallback));

const envBooleanSchema = (fallback: boolean) =>
    z.preprocess(
        emptyToUndefined,
        z
            .enum(["true", "false"])
            .default(fallback ? "true" : "false")
            .transform((value) => value === "true"),
    );

const envOptionalBooleanSchema = z.preprocess(
    emptyToUndefined,
    z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),
);

// non-negative because "trust proxy" hops can legitimately be 0 (no proxy in front)
const envOptionalHopsSchema = z.preprocess(
    emptyToUndefined,
    z.coerce
        .number({ error: "must be a number" })
        .int("must be an integer")
        .nonnegative("must be zero or greater")
        .optional(),
);

export const envSchema = z.object({
    NODE_ENV: envStringSchema("development"),
    PORT: envNumberSchema(3000),
    DB_USER: envStringSchema(DEFAULT_DB_USER),
    DB_PASSWORD: envStringSchema(DEFAULT_DB_PASSWORD),
    DB_HOST: envStringSchema("localhost"),
    DB_PORT: envNumberSchema(5432),
    DB_NAME: envStringSchema("cooking_helper"),
    // SSL is on by default in production; rejectUnauthorized can be turned off for managed Postgres that presents a private/self-signed CA (e.g. Azure)
    DB_SSL: envOptionalBooleanSchema,
    DB_SSL_REJECT_UNAUTHORIZED: envBooleanSchema(true),
    TRUST_PROXY_HOPS: envOptionalHopsSchema,
    RATE_LIMIT_MAX: envNumberSchema(300),
    RATE_LIMIT_WINDOW_MS: envNumberSchema(60000),
    CORS_ORIGIN: envStringSchema("http://localhost:8080"),
    COOKIE_DOMAIN: z.preprocess(emptyToUndefined, z.string().optional()),
    JWT_SECRET_KEY: z.preprocess(
        emptyToUndefined,
        z.string().min(32, "must be at least 32 characters").optional(),
    ),
    // both optional - absence picks LoggingEmailService over ResendEmailService (see composition-root.ts)
    RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
    EMAIL_FROM: z.preprocess(emptyToUndefined, z.string().optional()),
    // uploaded images; relative paths resolve against the working directory
    MEDIA_DIR: envStringSchema("uploads"),
    LOG_LEVEL: z
        .preprocess(
            emptyToUndefined,
            z
                .enum([
                    "fatal",
                    "error",
                    "warn",
                    "info",
                    "debug",
                    "trace",
                    "silent",
                ])
                .default("info"),
        )
        .optional(),
});
