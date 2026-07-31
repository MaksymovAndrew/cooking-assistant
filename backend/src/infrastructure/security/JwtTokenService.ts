import { createHash } from "crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { requireJwtSecret } from "config/env";
import { SESSION_TOKEN_TYPE } from "config/security";

import type {
    TokenPurpose,
    TokenService,
} from "application/ports/TokenService";

const BINDING_FINGERPRINT_LENGTH = 16;

// the purpose claim means a reset/verify link can never be replayed as a session token, or vice versa
function isPurposePayload(
    decoded: string | JwtPayload | null,
    purpose: TokenPurpose,
): decoded is JwtPayload & {
    id: number;
    purpose: TokenPurpose;
    binding?: string;
} {
    if (typeof decoded !== "object" || decoded === null) {
        return false;
    }

    return (
        typeof decoded.id === "number" &&
        Number.isInteger(decoded.id) &&
        decoded.id > 0 &&
        decoded.purpose === purpose
    );
}

// one-way fingerprint so the token carries proof a binding source hasn't changed, without embedding the source value itself (e.g. a password hash) in an emailed link
function fingerprintBinding(bindingSource: string): string {
    return createHash("sha256")
        .update(bindingSource)
        .digest("hex")
        .slice(0, BINDING_FINGERPRINT_LENGTH);
}

export default class JwtTokenService implements TokenService {
    generate(id: number): string {
        return jwt.sign({ id, typ: SESSION_TOKEN_TYPE }, requireJwtSecret(), {
            expiresIn: "24h",
            algorithm: "HS256",
        });
    }

    generatePurposeToken(
        id: number,
        purpose: TokenPurpose,
        expiresInSeconds: number,
        bindingSource?: string,
    ): string {
        const binding =
            bindingSource == null ? null : fingerprintBinding(bindingSource);

        return jwt.sign(
            { id, purpose, ...(binding !== null && { binding }) },
            requireJwtSecret(),
            { expiresIn: expiresInSeconds, algorithm: "HS256" },
        );
    }

    verifyPurposeToken(
        token: string,
        purpose: TokenPurpose,
        bindingSource?: string,
    ): number | null {
        try {
            const decoded = jwt.verify(token, requireJwtSecret(), {
                algorithms: ["HS256"],
            });

            if (!isPurposePayload(decoded, purpose)) {
                return null;
            }

            const expectedBinding =
                bindingSource == null
                    ? null
                    : fingerprintBinding(bindingSource);
            const isBindingMismatch =
                expectedBinding !== null && decoded.binding !== expectedBinding;

            return isBindingMismatch ? null : decoded.id;
        } catch {
            return null;
        }
    }
}
