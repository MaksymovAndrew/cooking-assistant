import type { Request } from "express";

// Express 5 leaves req.body undefined when no JSON was sent, and a client can send any JSON value
export function requestBody(req: Request): Record<string, unknown> {
    const body: unknown = req.body;
    const isJsonObject =
        typeof body === "object" && body !== null && !Array.isArray(body);

    return isJsonObject ? Object.fromEntries(Object.entries(body)) : {};
}
