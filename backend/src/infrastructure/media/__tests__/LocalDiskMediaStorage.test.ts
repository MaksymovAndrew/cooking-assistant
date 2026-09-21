import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import LocalDiskMediaStorage from "infrastructure/media/LocalDiskMediaStorage";

const KEY = "0b1c2d3e-1111-2222-3333-444455556666";
const VARIANTS = [
    { width: 400, data: Buffer.from("small") },
    { width: 1200, data: Buffer.from("large") },
];

describe("LocalDiskMediaStorage", () => {
    let directory: string;

    beforeEach(async () => {
        directory = await mkdtemp(path.join(tmpdir(), "media-"));
    });

    afterEach(async () => {
        await rm(directory, { recursive: true, force: true });
    });

    it("should write one file per width under the generated key", async () => {
        const storage = new LocalDiskMediaStorage(directory);

        await storage.save(KEY, VARIANTS);

        expect((await readdir(directory)).sort()).toEqual([
            `${KEY}-1200.webp`,
            `${KEY}-400.webp`,
        ]);
        expect(
            await readFile(path.join(directory, `${KEY}-400.webp`), "utf8"),
        ).toBe("small");
    });

    it("should create its directory on the first save", async () => {
        const nested = path.join(directory, "uploads");
        const storage = new LocalDiskMediaStorage(nested);

        await storage.save(KEY, VARIANTS);

        expect(await readdir(nested)).toHaveLength(2);
    });

    it("should refuse to overwrite a stored file", async () => {
        const storage = new LocalDiskMediaStorage(directory);

        await storage.save(KEY, VARIANTS);

        await expect(storage.save(KEY, VARIANTS)).rejects.toThrow();
    });

    it("should locate a stored file and nothing else", async () => {
        const storage = new LocalDiskMediaStorage(directory);

        await storage.save(KEY, VARIANTS);

        expect(await storage.locate(`${KEY}-400.webp`)).toBe(
            path.join(directory, `${KEY}-400.webp`),
        );
        expect(await storage.locate(`${KEY}-800.webp`)).toBeNull();
    });

    it("should never resolve a path outside its directory", async () => {
        const storage = new LocalDiskMediaStorage(
            path.join(directory, "inner"),
        );

        await storage.save(KEY, VARIANTS);

        expect(await storage.locate(`../inner/${KEY}-400.webp`)).toBe(
            path.join(directory, "inner", `${KEY}-400.webp`),
        );
        expect(await storage.locate("../../package.json")).toBeNull();
    });

    it("should remove every width of a key", async () => {
        const storage = new LocalDiskMediaStorage(directory);

        await storage.save(KEY, VARIANTS);
        await storage.remove(KEY);

        expect(await readdir(directory)).toEqual([]);
    });

    it("should not fail when removing a key that is already gone", async () => {
        const storage = new LocalDiskMediaStorage(directory);

        await expect(storage.remove(KEY)).resolves.toBeUndefined();
    });
});
