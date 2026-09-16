import type { Request } from "express";

export function getUserId(req: Request): number {
    if (!req.user) {
        throw new Error("Authenticated user is missing");
    }

    return req.user.id;
}

// for routes behind optionalAuth: no throw, since an anonymous requester is a valid outcome there
export function getOptionalUserId(req: Request): number | null {
    return req.user?.id ?? null;
}
