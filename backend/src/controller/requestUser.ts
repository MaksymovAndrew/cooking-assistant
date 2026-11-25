import type { Request } from "express";

export function getUserId(req: Pick<Request, "user">): number {
    if (!req.user) {
        throw new Error("Authenticated user is missing");
    }

    return req.user.id;
}

export function getOptionalUserId(req: Pick<Request, "user">): number | null {
    return req.user?.id ?? null;
}
