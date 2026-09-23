import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";

import { ERROR_CODES } from "constants/errorCodes";

import { errorBody } from "test/helpers/errorBody";
import { buildTestApp } from "test/helpers/testApp";

const FILE_NAME = "0b1c2d3e-1111-2222-3333-444455556666-400.webp";

describe("media routes", () => {
    let directory: string;
    let storedFile: string;

    beforeEach(async () => {
        directory = await mkdtemp(path.join(tmpdir(), "media-route-"));
        storedFile = path.join(directory, FILE_NAME);
        await writeFile(storedFile, Buffer.from("RIFF0000WEBP", "latin1"));
    });

    afterEach(async () => {
        await rm(directory, { recursive: true, force: true });
    });

    it("should serve a stored image to anyone, without a session", async () => {
        const { app, deps } = buildTestApp();

        deps.mediaStorage.locate.mockResolvedValue(storedFile);

        const res = await request(app).get(`/api/media/${FILE_NAME}`);

        expect(res.status).toBe(200);
        expect(deps.mediaStorage.locate).toHaveBeenCalledWith(FILE_NAME);
    });

    it("should send the headers that keep an image from being anything else", async () => {
        const { app, deps } = buildTestApp();

        deps.mediaStorage.locate.mockResolvedValue(storedFile);

        const res = await request(app).get(`/api/media/${FILE_NAME}`);

        expect(res.headers["content-type"]).toBe("image/webp");
        expect(res.headers["x-content-type-options"]).toBe("nosniff");
        expect(res.headers["content-disposition"]).toBe("inline");
        expect(res.headers["cache-control"]).toBe(
            "public, max-age=31536000, immutable",
        );
        // helmet's default same-origin would stop the app's subdomain from showing the image
        expect(res.headers["cross-origin-resource-policy"]).toBe("same-site");
    });

    it("should serve the link preview variant as a JPEG", async () => {
        const { app, deps } = buildTestApp();

        deps.mediaStorage.locate.mockResolvedValue(storedFile);

        const res = await request(app).get(
            `/api/media/${FILE_NAME.replace("400.webp", "og.jpg")}`,
        );

        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toBe("image/jpeg");
    });

    it("should answer 404 for a file that is not stored", async () => {
        const { app, deps } = buildTestApp();

        deps.mediaStorage.locate.mockResolvedValue(null);

        const res = await request(app).get(`/api/media/${FILE_NAME}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.MEDIA_NOT_FOUND));
    });

    it("should answer 404 for a name outside the generated pattern without asking the storage", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app).get("/api/media/..%2F.env");

        expect(res.status).toBe(404);
        expect(deps.mediaStorage.locate).not.toHaveBeenCalled();
    });
});
