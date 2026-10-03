import { existsSync } from "node:fs";
import path from "node:path";

import {
    assertConsistentEmailConfig,
    assertProductionSecrets,
    assertSecureProductionDb,
} from "./env.guards";
import { envSchema } from "./env.schema";

const LOCAL_ENV_FILE = ".env";

// production gets its variables from compose and ships no file; a variable already set always wins
if (existsSync(LOCAL_ENV_FILE)) {
    process.loadEnvFile(LOCAL_ENV_FILE);
}

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
    // app pool only: migrations and the seed use config.db, free of the statement deadline
    dbPool: {
        max: env.DB_POOL_MAX,
        connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
        idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
        statement_timeout: env.DB_STATEMENT_TIMEOUT_MS,
    },
    corsOrigin: env.CORS_ORIGIN,
    cookieDomain: env.COOKIE_DOMAIN,
    resendApiKey: env.RESEND_API_KEY,
    emailFrom: env.EMAIL_FROM,
    mediaDir: path.resolve(env.MEDIA_DIR),
    logLevel: env.LOG_LEVEL ?? "info",
    // no trusted proxy in dev, so a spoofed X-Forwarded-For cannot re-key the rate limiter
    trustProxyHops: env.TRUST_PROXY_HOPS ?? (isProduction ? 1 : 0),
    rateLimitMax: env.RATE_LIMIT_MAX,
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
};

export function requireJwtSecret(): string {
    const secret = process.env.JWT_SECRET_KEY;

    if (!secret) {
        throw new Error("JWT secret is not configured");
    }

    return secret;
}

// at config load, so the migrate and seed scripts are guarded too, not just the app
assertSecureProductionDb(config);
assertConsistentEmailConfig(config);
assertProductionSecrets({ isProduction, jwtSecret: env.JWT_SECRET_KEY });
