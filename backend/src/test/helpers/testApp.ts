import { createApp } from "app";
import { buildControllers } from "composition-root";
import jwt from "jsonwebtoken";

import { AUTH_COOKIE_NAME } from "config/cookie";
import { SESSION_TOKEN_TYPE } from "config/security";

import { buildFakeDeps } from "./fakeRepositories";

export function buildTestApp() {
    const deps = buildFakeDeps();
    const app = createApp(buildControllers(deps));

    return { app, deps };
}

// the session is an httpOnly cookie, so tests authenticate via the Cookie header
export function authCookie(userId = 1): string {
    const token = jwt.sign(
        { id: userId, typ: SESSION_TOKEN_TYPE },
        process.env.JWT_SECRET_KEY ?? "",
    );

    return `${AUTH_COOKIE_NAME}=${token}`;
}
