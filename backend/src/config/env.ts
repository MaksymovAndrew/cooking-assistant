import "dotenv/config";

import path from "node:path";

import {
    assertConsistentEmailConfig,
    assertSecureProductionDb,
} from "./env.guards";
import { envSchema } from "./env.schema";

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
    mediaDir: path.resolve(env.MEDIA_DIR),
    logLevel: env.LOG_LEVEL ?? "info",
    // default to no trusted proxy in dev so a spoofed X-Forwarded-For cannot re-key the rate limiter; one hop in production (configurable per topology)
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

// run at config load so every consumer of config.db (the app, the migrate runner, and the seed script) is guarded, not just the HTTP entry point
assertSecureProductionDb(config);
assertConsistentEmailConfig(config);
