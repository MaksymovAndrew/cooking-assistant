import request from "supertest";

import { ERROR_CODES } from "constants/errorCodes";
import { DEFAULT_LOCALE } from "constants/locales";
import { translateMessage } from "i18n/translate";

import { errorBody } from "test/helpers/errorBody";
import { authCookie, buildTestApp } from "test/helpers/testApp";

const LOCALE_PATH = "/api/me/locale";
const ACCEPT_LANGUAGE = "Accept-Language";
const UNSUPPORTED_LANGUAGE = "fr-FR,fr;q=0.9";

describe("locale routes", () => {
    it("should store the account's language", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .put(LOCALE_PATH)
            .set("Cookie", authCookie())
            .send({ locale: DEFAULT_LOCALE });

        expect(res.status).toBe(204);
        expect(deps.userRepository.updateLocale).toHaveBeenCalledWith(
            1,
            DEFAULT_LOCALE,
        );
    });

    it("should return 401 on PUT /api/me/locale without a token", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .put(LOCALE_PATH)
            .send({ locale: DEFAULT_LOCALE });

        expect(res.status).toBe(401);
        expect(deps.userRepository.updateLocale).not.toHaveBeenCalled();
    });

    it("should reject a language the server has no copy for", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .put(LOCALE_PATH)
            .set("Cookie", authCookie())
            .send({ locale: "fr" });

        expect(res.status).toBe(400);
        expect(deps.userRepository.updateLocale).not.toHaveBeenCalled();
    });

    it("should answer an error in the default language when the requested one is unsupported", async () => {
        const { app } = buildTestApp();

        const res = await request(app)
            .get("/api/no-such-route")
            .set(ACCEPT_LANGUAGE, UNSUPPORTED_LANGUAGE);

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.NOT_FOUND));
    });

    it("should answer a message in the requested language's base locale", async () => {
        const { app } = buildTestApp();

        const res = await request(app)
            .post("/api/logout")
            .set(ACCEPT_LANGUAGE, "en-GB,en;q=0.9");

        expect(res.body).toEqual({
            message: translateMessage("loggedOut", DEFAULT_LOCALE),
        });
    });

    it("should register the account in the language the request asked for", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.create.mockResolvedValue({
            id: 7,
            session_version: 0,
        });
        deps.tokenService.generate.mockReturnValue("token-value");

        await request(app)
            .post("/api/register")
            .set(ACCEPT_LANGUAGE, "en-US")
            .send({
                name: "Bob",
                surname: "Cook",
                login: "bob",
                email: "bob@example.com",
                password: "secret1!",
            });

        expect(deps.userRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ locale: DEFAULT_LOCALE }),
        );
    });
});
