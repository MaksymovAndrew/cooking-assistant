import { DEFAULT_DB_PASSWORD, DEFAULT_DB_USER } from "./env.schema";

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
