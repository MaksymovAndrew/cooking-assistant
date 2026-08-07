import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { requireJwtSecret } from "config/env";

import { isSessionPayload, readSessionCookie } from "./jwtMiddleware";

// same cookie + signature + typ check as authenticateToken, but a missing or invalid token falls
// through as an anonymous request instead of rejecting - used on reads a guest may access
const optionalAuth: RequestHandler = (req, _res, next) => {
    const token = readSessionCookie(req);

    if (!token) {
        next();

        return;
    }

    const secret = requireJwtSecret();

    jwt.verify(token, secret, { algorithms: ["HS256"] }, (err, decoded) => {
        if (err === null && isSessionPayload(decoded)) {
            req.user = { id: decoded.id };
        }

        next();
    });
};

export default optionalAuth;
