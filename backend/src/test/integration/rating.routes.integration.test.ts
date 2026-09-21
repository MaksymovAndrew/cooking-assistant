import request from "supertest";

import { ERROR_CODES } from "constants/errorCodes";

import { errorBody } from "test/helpers/errorBody";
import { authCookie, buildTestApp } from "test/helpers/testApp";

const RECIPE_5_RATING_PATH = "/api/recipe/5/rating";

describe("rating routes", () => {
    it("should return 401 without a session", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .put(RECIPE_5_RATING_PATH)
            .send({ value: 4 });

        expect(res.status).toBe(401);
        expect(res.body).toEqual(errorBody(ERROR_CODES.SESSION_EXPIRED));
        expect(deps.ratingRepository.rate).not.toHaveBeenCalled();
    });

    it("should rate a recipe for the signed-in user with a 204", async () => {
        const { app, deps } = buildTestApp();

        deps.ratingRepository.rate.mockResolvedValue("rated");

        const res = await request(app)
            .put(RECIPE_5_RATING_PATH)
            .set("Cookie", authCookie(7))
            .send({ value: 4 });

        expect(res.status).toBe(204);
        expect(deps.ratingRepository.rate).toHaveBeenCalledWith(
            7,
            "recipe",
            5,
            4,
        );
    });

    it("should map a missing recipe to a 404 response", async () => {
        const { app, deps } = buildTestApp();

        deps.ratingRepository.rate.mockResolvedValue("not_found");

        const res = await request(app)
            .put("/api/recipe/999/rating")
            .set("Cookie", authCookie(7))
            .send({ value: 4 });

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.RECIPE_NOT_FOUND));
    });

    it("should refuse a rating on the viewer's own recipe with a 400", async () => {
        const { app, deps } = buildTestApp();

        deps.ratingRepository.rate.mockResolvedValue("own_record");

        const res = await request(app)
            .put(RECIPE_5_RATING_PATH)
            .set("Cookie", authCookie(7))
            .send({ value: 5 });

        expect(res.status).toBe(400);
        expect(res.body).toEqual(errorBody(ERROR_CODES.RATING_OWN_RECORD));
    });

    it("should reject a rating outside 1 to 5 with a 400", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .put(RECIPE_5_RATING_PATH)
            .set("Cookie", authCookie(7))
            .send({ value: 9 });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            error: "value: Rating must be at most 5",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
        expect(deps.ratingRepository.rate).not.toHaveBeenCalled();
    });

    it("should remove a recipe rating with a 204", async () => {
        const { app, deps } = buildTestApp();

        deps.ratingRepository.remove.mockResolvedValue(undefined);

        const res = await request(app)
            .delete(RECIPE_5_RATING_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(204);
        expect(deps.ratingRepository.remove).toHaveBeenCalledWith(
            7,
            "recipe",
            5,
        );
    });

    it("should rate and unrate a menu", async () => {
        const { app, deps } = buildTestApp();

        deps.ratingRepository.rate.mockResolvedValue("rated");
        deps.ratingRepository.remove.mockResolvedValue(undefined);

        const rated = await request(app)
            .put("/api/menu/9/rating")
            .set("Cookie", authCookie(7))
            .send({ value: 2 });
        const removed = await request(app)
            .delete("/api/menu/9/rating")
            .set("Cookie", authCookie(7));

        expect(rated.status).toBe(204);
        expect(removed.status).toBe(204);
        expect(deps.ratingRepository.rate).toHaveBeenCalledWith(
            7,
            "menu",
            9,
            2,
        );
        expect(deps.ratingRepository.remove).toHaveBeenCalledWith(7, "menu", 9);
    });
});
