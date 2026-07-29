import "dotenv/config";

import { z } from "zod";

import { ERROR_MESSAGES } from "constants/errorMessages";
import { AppError } from "domain/errors/AppError";

// shared by the schema defaults and the production guard so the "insecure default" check can never drift from the value it is guarding against
const DEFAULT_DB_USER = "postgres";
const DEFAULT_DB_PASSWORD = "12345678";

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

const envSchema = z.object({
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

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    const message = parsedEnv.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

    throw new Error(`Invalid environment configuration: ${message}`);
}

const env = parsedEnv.data;

const isProduction = env.NODE_ENV === "production";
const useSsl = env.DB_SSL ?? isProduction;

export const config = {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    isProduction,
    db: {
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        ssl: useSsl
            ? { rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED }
            : false,
    },
    corsOrigin: env.CORS_ORIGIN,
    cookieDomain: env.COOKIE_DOMAIN,
    resendApiKey: env.RESEND_API_KEY,
    emailFrom: env.EMAIL_FROM,
    logLevel: env.LOG_LEVEL ?? "info",
    // default to no trusted proxy in dev so a spoofed X-Forwarded-For cannot re-key the rate limiter; one hop in production (configurable per topology)
    trustProxyHops: env.TRUST_PROXY_HOPS ?? (isProduction ? 1 : 0),
    rateLimitMax: env.RATE_LIMIT_MAX,
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
};

export function requireJwtSecret(): string {
    const secret = process.env.JWT_SECRET_KEY;

    if (!secret) {
        throw new AppError(ERROR_MESSAGES.JWT_NOT_CONFIGURED, 500);
    }

    return secret;
}

export function assertSecureProductionDb(cfg: {
    isProduction: boolean;
    db: { user: string; password: string };
}): void {
    const hasDefaultUser = cfg.db.user === DEFAULT_DB_USER;
    const hasDefaultPassword = cfg.db.password === DEFAULT_DB_PASSWORD;
    const isUnsafe = hasDefaultUser || hasDefaultPassword;

    if (cfg.isProduction && isUnsafe) {
        throw new Error(
            "Invalid environment configuration: refusing to start in production with default database credentials. Set DB_USER and DB_PASSWORD to secure values.",
        );
    }
}

export function assertConsistentEmailConfig(cfg: {
    resendApiKey?: string;
    emailFrom?: string;
}): void {
    const hasOnlyOne = Boolean(cfg.resendApiKey) !== Boolean(cfg.emailFrom);

    if (hasOnlyOne) {
        throw new Error(
            "Invalid environment configuration: RESEND_API_KEY and EMAIL_FROM must be set together (or both left unset to use the logging email fallback).",
        );
    }
}

// run at config load so every consumer of config.db (the app, the migrate runner, and the seed script) is guarded, not just the HTTP entry point
assertSecureProductionDb(config);
assertConsistentEmailConfig(config);
