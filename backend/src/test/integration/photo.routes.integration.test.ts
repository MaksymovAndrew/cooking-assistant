import request from "supertest";

import { ERROR_CODES } from "constants/errorCodes";

import { IMAGE_VARIANTS } from "application/media/mediaFiles";

import { errorBody } from "test/helpers/errorBody";
import { authCookie, buildTestApp } from "test/helpers/testApp";

const RECIPE_PHOTO_PATH = "/api/recipe/5/photo";
const CONTENT_TYPE = "Content-Type";
const IMAGE_JPEG = "image/jpeg";
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const VARIANTS = IMAGE_VARIANTS.map((spec) => ({
    spec,
    data: Buffer.from(spec.name),
}));
const UUID = /^[0-9a-f-]{36}$/;
// one byte over the 10 MB upload limit
const OVERSIZED = Buffer.alloc(10 * 1024 * 1024 + 1);

function buildUploadApp() {
    const { app, deps } = buildTestApp();

    deps.imageProcessor.toVariants.mockResolvedValue(VARIANTS);
    deps.photoRepository.replace.mockResolvedValue({ previousKey: null });

    return { app, deps };
}

describe("photo routes", () => {
    it("should return 401 without a session and never read the image", async () => {
        const { app, deps } = buildUploadApp();

        const res = await request(app)
            .put(RECIPE_PHOTO_PATH)
            .set(CONTENT_TYPE, IMAGE_JPEG)
            .send(JPEG);

        expect(res.status).toBe(401);
        expect(res.body).toEqual(errorBody(ERROR_CODES.SESSION_EXPIRED));
        expect(deps.imageProcessor.toVariants).not.toHaveBeenCalled();
    });

    it("should store a recipe photo and answer with its new key", async () => {
        const { app, deps } = buildUploadApp();

        const res = await request(app)
            .put(RECIPE_PHOTO_PATH)
            .set("Cookie", authCookie(7))
            .set(CONTENT_TYPE, IMAGE_JPEG)
            .send(JPEG);

        const body = res.body as { photo_key: string };

        expect(res.status).toBe(200);
        expect(body.photo_key).toMatch(UUID);
        expect(deps.imageProcessor.toVariants).toHaveBeenCalledWith(
            JPEG,
            IMAGE_VARIANTS,
        );
        expect(deps.photoRepository.replace).toHaveBeenCalledWith(
            7,
            "recipe",
            5,
            body.photo_key,
        );
    });

    it("should judge the image by its bytes, not by the Content-Type it claims", async () => {
        const { app, deps } = buildUploadApp();

        const res = await request(app)
            .put(RECIPE_PHOTO_PATH)
            .set("Cookie", authCookie(7))
            .set(CONTENT_TYPE, "image/png")
            .send(Buffer.from("<svg onload=alert(1)>", "utf8"));

        expect(res.status).toBe(400);
        expect(res.body).toEqual(errorBody(ERROR_CODES.MEDIA_UNSUPPORTED_TYPE));
        expect(deps.imageProcessor.toVariants).not.toHaveBeenCalled();
    });

    it("should accept an image sent with no Content-Type at all", async () => {
        const { app } = buildUploadApp();

        const res = await request(app)
            .put(RECIPE_PHOTO_PATH)
            .set("Cookie", authCookie(7))
            .set(CONTENT_TYPE, "application/octet-stream")
            .send(JPEG);

        expect(res.status).toBe(200);
    });

    it("should refuse a JSON body instead of an image", async () => {
        const { app } = buildUploadApp();

        const res = await request(app)
            .put(RECIPE_PHOTO_PATH)
            .set("Cookie", authCookie(7))
            .send({ photo: "data:image/png;base64,AAAA" });

        expect(res.status).toBe(400);
        expect(res.body).toEqual(errorBody(ERROR_CODES.MEDIA_UNSUPPORTED_TYPE));
    });

    it("should answer 413 with its own code for an image over the limit", async () => {
        const { app, deps } = buildUploadApp();

        const res = await request(app)
            .put(RECIPE_PHOTO_PATH)
            .set("Cookie", authCookie(7))
            .set(CONTENT_TYPE, IMAGE_JPEG)
            .send(OVERSIZED);

        expect(res.status).toBe(413);
        expect(res.body).toEqual(errorBody(ERROR_CODES.MEDIA_TOO_LARGE));
        expect(deps.imageProcessor.toVariants).not.toHaveBeenCalled();
    });

    it("should map a menu that is not the user's to a 404", async () => {
        const { app, deps } = buildUploadApp();

        deps.photoRepository.replace.mockResolvedValue(null);

        const res = await request(app)
            .put("/api/menu/3/photo")
            .set("Cookie", authCookie(7))
            .set(CONTENT_TYPE, IMAGE_JPEG)
            .send(JPEG);

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.MENU_NOT_FOUND));
    });

    it("should store an avatar against the signed-in account", async () => {
        const { app, deps } = buildUploadApp();

        const res = await request(app)
            .put("/api/me/avatar")
            .set("Cookie", authCookie(7))
            .set(CONTENT_TYPE, IMAGE_JPEG)
            .send(JPEG);

        const body = res.body as { photo_key: string };

        expect(res.status).toBe(200);
        expect(deps.photoRepository.replace).toHaveBeenCalledWith(
            7,
            "avatar",
            7,
            body.photo_key,
        );
    });

    it("should remove a recipe photo with a 204", async () => {
        const { app, deps } = buildUploadApp();

        deps.photoRepository.replace.mockResolvedValue({
            previousKey: "old-key",
        });

        const res = await request(app)
            .delete(RECIPE_PHOTO_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(204);
        expect(deps.photoRepository.replace).toHaveBeenCalledWith(
            7,
            "recipe",
            5,
            null,
        );
        expect(deps.mediaStorage.remove).toHaveBeenCalledWith("old-key");
    });

    it("should remove the avatar photo with a 204", async () => {
        const { app, deps } = buildUploadApp();

        const res = await request(app)
            .delete("/api/me/avatar")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(204);
        expect(deps.photoRepository.replace).toHaveBeenCalledWith(
            7,
            "avatar",
            7,
            null,
        );
    });

    it("should remove a menu cover with a 204", async () => {
        const { app, deps } = buildUploadApp();

        const res = await request(app)
            .delete("/api/menu/3/photo")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(204);
        expect(deps.photoRepository.replace).toHaveBeenCalledWith(
            7,
            "menu",
            3,
            null,
        );
    });
});
