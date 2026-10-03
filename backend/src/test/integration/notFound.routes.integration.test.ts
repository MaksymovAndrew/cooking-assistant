import request from "supertest";

import { ERROR_CODES } from "constants/errorCodes";

import { errorBody } from "test/helpers/errorBody";
import { buildTestApp } from "test/helpers/testApp";

describe("not found routes", () => {
    it("should return a JSON 404 for an unknown route", async () => {
        const { app } = buildTestApp();

        const res = await request(app).get("/api/does-not-exist");

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.NOT_FOUND));
    });
});
