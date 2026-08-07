import type { Request } from "express";

import { ERROR_MESSAGES } from "constants/errorMessages";

export function getUserId(req: Request): number {
    if (!req.user) {
        throw new Error(ERROR_MESSAGES.AUTHENTICATED_USER_MISSING);
    }

    return req.user.id;
}

// for routes behind optionalAuth: no throw, since an anonymous requester is a valid outcome there
export function getOptionalUserId(req: Request): number | null {
    return req.user?.id ?? null;
}
