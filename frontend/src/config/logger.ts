const isDev = process.env.NODE_ENV !== "production";

// a server render's console is the container's log, its only way to report a failure
const isServer = typeof window === "undefined";
const reportsProblems = isDev || isServer;

export const logger = {
    error: (...args: unknown[]) => {
        if (reportsProblems) console.error(...args);
    },
    warn: (...args: unknown[]) => {
        if (reportsProblems) console.warn(...args);
    },
    info: (...args: unknown[]) => {
        if (isDev) console.info(...args);
    },
    debug: (...args: unknown[]) => {
        if (isDev) console.debug(...args);
    },
};
