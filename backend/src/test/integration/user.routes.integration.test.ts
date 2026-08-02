import type { IncomingHttpHeaders } from "http";
import request from "supertest";

import {
    ERROR_CODES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from "constants/errorMessages";

import { authCookie, buildTestApp } from "test/helpers/testApp";

const LOGIN_PATH = "/api/login";
const CHANGE_PASSWORD_PATH = "/api/change-password";
const EMAIL = "bob@example.com";
const NEW_PASSWORD = "new-secret1!";
const HASHED_NEW_PASSWORD = "hashed-new-secret";
const CURRENT_PASSWORD = "current-secret";
const HASHED_CURRENT_PASSWORD = "hashed-current";
const TOKEN_VALUE = "token-value";
const VERIFY_TOKEN = "verify-token";
const CREATED_AT = "2026-01-15T00:00:00.000Z";

describe("user routes", () => {
    it("should return 401 without a token", async () => {
        const { app } = buildTestApp();

        const res = await request(app).get("/api/me");

        expect(res.status).toBe(401);
    });

    it("should register a user and log them in with a session cookie", async () => {
        const { app, deps } = buildTestApp();

        deps.passwordHasher.hash.mockResolvedValue("hashed-secret");
        deps.userRepository.create.mockResolvedValue({ id: 7 });
        deps.tokenService.generate.mockReturnValue(TOKEN_VALUE);

        const res = await request(app).post("/api/register").send({
            name: "Bob",
            surname: "Cook",
            login: "bob",
            email: EMAIL,
            password: "secret1!",
        });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ message: SUCCESS_MESSAGES.REGISTERED });
        expect(deps.userRepository.create).toHaveBeenCalledWith({
            name: "Bob",
            surname: "Cook",
            login: "bob",
            email: EMAIL,
            password: "hashed-secret",
        });

        const headers = res.headers as IncomingHttpHeaders;

        expect(headers["set-cookie"]?.join(";") ?? "").toContain(
            `authToken=${TOKEN_VALUE}`,
        );
    });

    it("should log in and set an httpOnly session cookie", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.findByLogin.mockResolvedValue({
            id: 7,
            login: "bob",
            password: "hash",
        });
        deps.passwordHasher.compare.mockResolvedValue(true);
        deps.tokenService.generate.mockReturnValue(TOKEN_VALUE);

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

    it("should log in with an email identifier instead of a username", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.findCredentialsByEmail.mockResolvedValue({
            id: 7,
            password: "hash",
        });
        deps.passwordHasher.compare.mockResolvedValue(true);
        deps.tokenService.generate.mockReturnValue(TOKEN_VALUE);

        const res = await request(app).post(LOGIN_PATH).send({
            login: EMAIL,
            password: "secret",
        });

        expect(res.status).toBe(200);
        expect(deps.userRepository.findCredentialsByEmail).toHaveBeenCalledWith(
            EMAIL,
        );
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
            created_at: CREATED_AT,
            email: EMAIL,
            email_verified_at: null,
            avatar: null,
            calorie_goal: null,
            meal_calorie_limit: null,
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
            code: ERROR_CODES.INVALID_LOGIN_OR_PASSWORD,
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

    it("should send a reset link and respond generically for a verified email", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.findPasswordResetCandidateByEmail.mockResolvedValue(
            {
                id: 7,
                password: "hashed-current-secret",
                email_verified_at: "2026-01-01T00:00:00.000Z",
            },
        );
        deps.tokenService.generatePurposeToken.mockReturnValue("reset-token");

        const res = await request(app)
            .post("/api/forgot-password")
            .send({ email: EMAIL });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
        });
        expect(deps.emailSender.sendPasswordResetEmail).toHaveBeenCalledWith(
            EMAIL,
            `${deps.frontendOrigin}/reset-password?token=reset-token`,
        );
    });

    it("should respond generically without sending an email for an unknown email", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.findPasswordResetCandidateByEmail.mockResolvedValue(
            null,
        );

        const res = await request(app)
            .post("/api/forgot-password")
            .send({ email: EMAIL });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
        });
        expect(deps.emailSender.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should reset the password for a valid reset token", async () => {
        const { app, deps } = buildTestApp();

        deps.tokenService.verifyPurposeToken.mockReturnValue(7);
        deps.userRepository.findCredentialsById.mockResolvedValue({
            id: 7,
            password: "hashed-current-secret",
        });
        deps.passwordHasher.hash.mockResolvedValue(HASHED_NEW_PASSWORD);

        const res = await request(app).post("/api/reset-password").send({
            token: "reset-token",
            newPassword: NEW_PASSWORD,
        });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: SUCCESS_MESSAGES.PASSWORD_RESET });
        expect(deps.userRepository.updatePassword).toHaveBeenCalledWith(
            7,
            HASHED_NEW_PASSWORD,
        );
    });

    it("should reject reset-password with an invalid or expired token", async () => {
        const { app, deps } = buildTestApp();

        deps.tokenService.verifyPurposeToken.mockReturnValue(null);

        const res = await request(app).post("/api/reset-password").send({
            token: "bad-token",
            newPassword: NEW_PASSWORD,
        });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            error: ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
            code: ERROR_CODES.INVALID_OR_EXPIRED_TOKEN,
        });
    });

    it("should return 401 on POST /api/change-password without a token", async () => {
        const { app } = buildTestApp();

        const res = await request(app).post(CHANGE_PASSWORD_PATH).send({
            currentPassword: CURRENT_PASSWORD,
            newPassword: NEW_PASSWORD,
        });

        expect(res.status).toBe(401);
    });

    it("should change the password for an authenticated request with the correct current password", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.findCredentialsById.mockResolvedValue({
            id: 1,
            password: HASHED_CURRENT_PASSWORD,
        });
        deps.passwordHasher.compare
            .mockResolvedValueOnce(true) // current password check
            .mockResolvedValueOnce(false); // new-password-same-as-current check
        deps.passwordHasher.hash.mockResolvedValue(HASHED_NEW_PASSWORD);

        const res = await request(app)
            .post(CHANGE_PASSWORD_PATH)
            .set("Cookie", authCookie())
            .send({
                currentPassword: CURRENT_PASSWORD,
                newPassword: NEW_PASSWORD,
            });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
        });
        expect(deps.userRepository.updatePassword).toHaveBeenCalledWith(
            1,
            HASHED_NEW_PASSWORD,
        );
    });

    it("should reject change-password with the wrong current password", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.findCredentialsById.mockResolvedValue({
            id: 1,
            password: HASHED_CURRENT_PASSWORD,
        });
        deps.passwordHasher.compare.mockResolvedValue(false);

        const res = await request(app)
            .post(CHANGE_PASSWORD_PATH)
            .set("Cookie", authCookie())
            .send({ currentPassword: "wrong", newPassword: NEW_PASSWORD });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            error: ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT,
            code: ERROR_CODES.CURRENT_PASSWORD_INCORRECT,
        });
        expect(deps.userRepository.updatePassword).not.toHaveBeenCalled();
    });

    it("should resend the verification link for an authenticated request", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.findById.mockResolvedValue({
            id: 1,
            name: "Bob",
            surname: "Cook",
            login: "bob",
            created_at: CREATED_AT,
            email: EMAIL,
            email_verified_at: null,
            avatar: null,
            calorie_goal: null,
            meal_calorie_limit: null,
        });
        deps.tokenService.generatePurposeToken.mockReturnValue(VERIFY_TOKEN);

        const res = await request(app)
            .post("/api/resend-verification-email")
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: SUCCESS_MESSAGES.VERIFICATION_EMAIL_SENT,
        });
        expect(deps.emailSender.sendVerificationEmail).toHaveBeenCalledWith(
            EMAIL,
            `${deps.frontendOrigin}/verify-email?token=verify-token`,
        );
    });

    it("should confirm the email for a valid verification token", async () => {
        const { app, deps } = buildTestApp();

        deps.tokenService.verifyPurposeToken.mockReturnValue(1);

        const res = await request(app)
            .post("/api/confirm-email")
            .send({ token: VERIFY_TOKEN });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: SUCCESS_MESSAGES.EMAIL_VERIFIED });
        expect(deps.userRepository.markEmailVerified).toHaveBeenCalledWith(1);
    });

    it("should reject confirm-email with an invalid or expired token", async () => {
        const { app, deps } = buildTestApp();

        deps.tokenService.verifyPurposeToken.mockReturnValue(null);

        const res = await request(app)
            .post("/api/confirm-email")
            .send({ token: "bad-token" });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            error: ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
            code: ERROR_CODES.INVALID_OR_EXPIRED_TOKEN,
        });
    });

    it("should return 401 on PATCH /api/me without a token", async () => {
        const { app } = buildTestApp();

        const res = await request(app)
            .patch("/api/me")
            .send({ name: "Claude", surname: "Cook", avatar: null });

        expect(res.status).toBe(401);
    });

    it("should update the profile for an authenticated request", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .patch("/api/me")
            .set("Cookie", authCookie())
            .send({ name: "Claude", surname: "Cook", avatar: "tomato" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: SUCCESS_MESSAGES.PROFILE_UPDATED,
        });
        expect(deps.userRepository.updateProfile).toHaveBeenCalledWith(1, {
            name: "Claude",
            surname: "Cook",
            avatar: "tomato",
        });
    });

    it("should reject PATCH /api/me with an unknown avatar key", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .patch("/api/me")
            .set("Cookie", authCookie())
            .send({ name: "Claude", surname: "Cook", avatar: "not-real" });

        expect(res.status).toBe(400);
        expect(deps.userRepository.updateProfile).not.toHaveBeenCalled();
    });

    it("should return 401 on DELETE /api/me without a token", async () => {
        const { app } = buildTestApp();

        const res = await request(app)
            .delete("/api/me")
            .send({ password: CURRENT_PASSWORD });

        expect(res.status).toBe(401);
    });

    it("should delete the account and clear the session cookie for the correct password", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.findCredentialsById.mockResolvedValue({
            id: 1,
            password: HASHED_CURRENT_PASSWORD,
        });
        deps.passwordHasher.compare.mockResolvedValue(true);

        const res = await request(app)
            .delete("/api/me")
            .set("Cookie", authCookie())
            .send({ password: CURRENT_PASSWORD });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: SUCCESS_MESSAGES.ACCOUNT_DELETED,
        });
        expect(deps.userRepository.delete).toHaveBeenCalledWith(1);

        const headers = res.headers as IncomingHttpHeaders;

        expect(headers["set-cookie"]?.join(";") ?? "").toContain("authToken=;");
    });

    it("should reject DELETE /api/me with the wrong password", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.findCredentialsById.mockResolvedValue({
            id: 1,
            password: HASHED_CURRENT_PASSWORD,
        });
        deps.passwordHasher.compare.mockResolvedValue(false);

        const res = await request(app)
            .delete("/api/me")
            .set("Cookie", authCookie())
            .send({ password: "wrong-password" });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            error: ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT,
            code: ERROR_CODES.CURRENT_PASSWORD_INCORRECT,
        });
        expect(deps.userRepository.delete).not.toHaveBeenCalled();
    });
});
