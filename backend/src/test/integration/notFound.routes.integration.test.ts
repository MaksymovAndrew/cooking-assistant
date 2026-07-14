import request from "supertest";

import { ERROR_CODES, ERROR_MESSAGES } from "constants/errorMessages";

import { buildTestApp } from "test/helpers/testApp";

describe("not found routes", () => {
    it("should return a JSON 404 for an unknown route", async () => {
        const { app } = buildTestApp();

        const res = await request(app).get("/api/does-not-exist");

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: ERROR_MESSAGES.NOT_FOUND });
    });

    it("should return a 400 error when register input is invalid", async () => {
        const { app } = buildTestApp();

        const res = await request(app).post("/api/register").send({});

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            error: "name: Name is required; surname: Surname is required; login: Login is required; email: Email is required; password: Password is required",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
    });
});
