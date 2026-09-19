import request from "supertest";

import { ERROR_CODES } from "constants/errorCodes";

import { errorBody } from "test/helpers/errorBody";
import { authCookie, buildTestApp } from "test/helpers/testApp";

const TAGS_PATH = "/api/tags";
const TAG_PATH = "/api/tags/3";
const RECIPE_TAGS_PATH = "/api/recipe/4/tags";
const TAG_NAME = "Weeknight";

describe("tag routes", () => {
    it("should return 401 without a session", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app).get(TAGS_PATH);

        expect(res.status).toBe(401);
        expect(res.body).toEqual(errorBody(ERROR_CODES.SESSION_EXPIRED));
        expect(deps.tagRepository.findByPerson).not.toHaveBeenCalled();
    });

    it("should return the signed-in user's tags", async () => {
        const { app, deps } = buildTestApp();
        const tags = [{ id: 3, name: TAG_NAME }];

        deps.tagRepository.findByPerson.mockResolvedValue(tags);

        const res = await request(app)
            .get(TAGS_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual(tags);
        expect(deps.tagRepository.findByPerson).toHaveBeenCalledWith(7);
    });

    it("should create a tag with a 201", async () => {
        const { app, deps } = buildTestApp();
        const tag = { id: 3, name: TAG_NAME };

        deps.tagRepository.create.mockResolvedValue({
            outcome: "created",
            tag,
        });

        const res = await request(app)
            .post(TAGS_PATH)
            .set("Cookie", authCookie(7))
            .send({ name: TAG_NAME });

        expect(res.status).toBe(201);
        expect(res.body).toEqual(tag);
    });

    it("should map a duplicate name to a 409 response", async () => {
        const { app, deps } = buildTestApp();

        deps.tagRepository.create.mockResolvedValue({
            outcome: "duplicate_name",
            tag: null,
        });

        const res = await request(app)
            .post(TAGS_PATH)
            .set("Cookie", authCookie(7))
            .send({ name: TAG_NAME });

        expect(res.status).toBe(409);
        expect(res.body).toEqual(errorBody(ERROR_CODES.TAG_DUPLICATE_NAME));
    });

    it("should rename and delete a tag with a 204", async () => {
        const { app, deps } = buildTestApp();

        deps.tagRepository.rename.mockResolvedValue("renamed");
        deps.tagRepository.delete.mockResolvedValue(true);

        const renamed = await request(app)
            .patch(TAG_PATH)
            .set("Cookie", authCookie(7))
            .send({ name: TAG_NAME });
        const deleted = await request(app)
            .delete(TAG_PATH)
            .set("Cookie", authCookie(7));

        expect(renamed.status).toBe(204);
        expect(deleted.status).toBe(204);
        expect(deps.tagRepository.rename).toHaveBeenCalledWith(7, 3, TAG_NAME);
        expect(deps.tagRepository.delete).toHaveBeenCalledWith(7, 3);
    });

    it("should map another user's tag to a 404 response", async () => {
        const { app, deps } = buildTestApp();

        deps.tagRepository.delete.mockResolvedValue(false);

        const res = await request(app)
            .delete(TAG_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.TAG_NOT_FOUND));
    });

    it("should replace the tags of a recipe with a 204", async () => {
        const { app, deps } = buildTestApp();

        deps.tagRepository.setRecipeTags.mockResolvedValue("saved");

        const res = await request(app)
            .put(RECIPE_TAGS_PATH)
            .set("Cookie", authCookie(7))
            .send({ tag_ids: [3] });

        expect(res.status).toBe(204);
        expect(deps.tagRepository.setRecipeTags).toHaveBeenCalledWith(
            7,
            4,
            [3],
        );
    });

    it("should map a tag the user does not own to a 404 response", async () => {
        const { app, deps } = buildTestApp();

        deps.tagRepository.setRecipeTags.mockResolvedValue("tags_not_found");

        const res = await request(app)
            .put(RECIPE_TAGS_PATH)
            .set("Cookie", authCookie(7))
            .send({ tag_ids: [99] });

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.TAG_NOT_FOUND));
    });

    it("should reject filtering by tags for a guest", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app).get(
            "/api/recipes-by-filters?tag_ids=3,4",
        );

        expect(res.status).toBe(400);
        expect(res.body).toEqual(errorBody(ERROR_CODES.TAGS_REQUIRES_LOGIN));
        expect(deps.recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should pass the tag filter through for a signed-in user", async () => {
        const { app, deps } = buildTestApp();

        deps.recipeRepository.search.mockResolvedValue({ items: [], total: 0 });

        const res = await request(app)
            .get("/api/recipes-by-filters?tag_ids=3,4")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(deps.recipeRepository.search).toHaveBeenCalledWith(7, {
            tag_ids: "3,4",
        });
    });
});
