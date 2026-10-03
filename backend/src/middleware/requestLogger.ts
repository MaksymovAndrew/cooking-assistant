import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import pinoHttp from "pino-http";

import { logger } from "config/logger";
import { HEALTH_PATH, MEDIA_PATH_PREFIX } from "constants/routes";

// req.url is raw: a cache-buster query or trailing slash still reaches the same route
const isQuietRequest = (req: { url?: string }): boolean => {
    const [pathname = ""] = (req.url ?? "").split("?");

    return (
        pathname.replace(/\/$/, "") === HEALTH_PATH ||
        pathname.startsWith(MEDIA_PATH_PREFIX)
    );
};

// a caller's id is kept for cross-service tracing, but only a plain token
const REQUEST_ID_PATTERN = /^[\w-]{1,64}$/;
const REQUEST_ID_HEADER = "x-request-id";

function requestId(req: IncomingMessage, res: ServerResponse): string {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const id =
        typeof incoming === "string" && REQUEST_ID_PATTERN.test(incoming)
            ? incoming
            : randomUUID();

    res.setHeader(REQUEST_ID_HEADER, id);

    return id;
}

// what pino-http hands a serializer: its own standard object, not the raw request
interface StandardRequestLog {
    id: unknown;
    method: string;
    url: string;
    headers: Record<string, string>;
}

interface StandardResponseLog {
    statusCode: number;
}

const LOGGED_REQUEST_HEADERS = ["user-agent", "x-forwarded-for"];

// the full header sets made every line ~2 KB, most of it the same static response headers
export const serializeRequest = (req: StandardRequestLog) => ({
    id: req.id,
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(
        LOGGED_REQUEST_HEADERS.filter((name) => name in req.headers).map(
            (name) => [name, req.headers[name]],
        ),
    ),
});

export const serializeResponse = (res: StandardResponseLog) => ({
    statusCode: res.statusCode,
});

export function createRequestLogger(): RequestHandler {
    return pinoHttp({
        logger,
        genReqId: requestId,
        serializers: { req: serializeRequest, res: serializeResponse },
        redact: [
            "req.headers.authorization",
            "req.headers.cookie",
            'res.headers["set-cookie"]',
        ],
        // the 15s probe and card images would crowd the 3 x 10 MB rotated logs
        autoLogging: { ignore: isQuietRequest },
    });
}
