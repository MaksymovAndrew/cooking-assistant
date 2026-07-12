import type { IncomingHttpHeaders } from "http";
import request from "supertest";

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "constants/errorMessages";

import { authCookie, buildTestApp } from "test/helpers/testApp";

const LOGIN_PATH = "/api/login";

describe("user routes", () => {
    it("should return 401 without a token", async () => {
        const { app } = buildTestApp();

        const res = await request(app).get("/api/user");

        expect(res.status).toBe(401);
    });

    it("should register a user without a token", async () => {
        const { app, deps } = buildTestApp();
        const createdUser = {
            id: 7,
            name: "Bob",
            surname: "Cook",
            login: "bob",
        };

        deps.passwordHasher.hash.mockResolvedValue("hashed-secret");
        deps.userRepository.create.mockResolvedValue(createdUser);

        const res = await request(app).post("/api/register").send({
            name: "Bob",
            surname: "Cook",
            login: "bob",
            password: "secret",
        });

        expect(res.status).toBe(201);
        expect(res.body).toEqual(createdUser);
        expect(deps.userRepository.create).toHaveBeenCalledWith({
            name: "Bob",
            surname: "Cook",
            login: "bob",
            password: "hashed-secret",
        });
    });

    it("should log in and set an httpOnly session cookie", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.findByLogin.mockResolvedValue({
            id: 7,
            login: "bob",
            password: "hash",
        });
        deps.passwordHasher.compare.mockResolvedValue(true);
        deps.tokenService.generate.mockReturnValue("token-value");

        const res = await request(app).post(LOGIN_PATH).send({
            login: "bob",
            password: "secret",
        });

        expect(res.status).toBe(200);
        // token lives only in the cookie, never in the response body
        expect(res.body).toEqual({ message: SUCCESS_MESSAGES.LOGGED_IN });

        const headers = res.headers as IncomingHttpHeaders;
        const setCookie = headers["set-cookie"]?.join(";") ?? "";

        expect(setCookie).toContain("authToken=token-value");
        expect(setCookie).toContain("HttpOnly");
        expect(setCookie).toContain("SameSite=Lax");
    });

    it("should clear the session cookie on logout", async () => {
        const { app } = buildTestApp();

        const res = await request(app).post("/api/logout");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: SUCCESS_MESSAGES.LOGGED_OUT });
        const logoutHeaders = res.headers as IncomingHttpHeaders;

        expect(logoutHeaders["set-cookie"]?.join(";") ?? "").toContain(
            "authToken=;",
        );
    });

    it("should return the current user for an authenticated request", async () => {
        const { app, deps } = buildTestApp();
        const currentUser = {
            id: 1,
            name: "Bob",
            surname: "Cook",
            login: "bob",
            created_at: "2026-01-15T00:00:00.000Z",
        };

        deps.userRepository.findById.mockResolvedValue(currentUser);

        const res = await request(app)
            .get("/api/me")
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(currentUser);
        expect(deps.userRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should return 401 on GET /api/me without a token", async () => {
        const { app } = buildTestApp();

        const res = await request(app).get("/api/me");

        expect(res.status).toBe(401);
    });

    it("should return 404 on GET /api/me when the user no longer exists", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.findById.mockResolvedValue(null);

        const res = await request(app)
            .get("/api/me")
            .set("Cookie", authCookie());

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: ERROR_MESSAGES.USER_NOT_FOUND });
    });

    it("should return users for an authenticated request", async () => {
        const { app, deps } = buildTestApp();
        const users = [{ id: 7, name: "Bob", surname: "Cook", login: "bob" }];

        deps.userRepository.findAll.mockResolvedValue(users);

        const res = await request(app)
            .get("/api/user")
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(users);
    });

    it("should map a login domain error to the response status", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.findByLogin.mockResolvedValue(null);

        const res = await request(app).post(LOGIN_PATH).send({
            login: "missing",
            password: "secret",
        });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            error: ERROR_MESSAGES.INVALID_LOGIN_OR_PASSWORD,
        });
    });

    it("should return a 400 error body for malformed JSON", async () => {
        const { app } = buildTestApp();

        const res = await request(app)
            .post(LOGIN_PATH)
            .set("Content-Type", "application/json")
            .send('{"login": "bob",');

        expect(res.status).toBe(400);
        const body = res.body as { error: string };

        expect(typeof body.error).toBe("string");
    });
});
