import { shareLink } from "utils/shareLink";

const TARGET = { title: "Borscht", url: "https://example.com/recipe/7" };

describe("shareLink", () => {
    it("should open the system share sheet when the browser has one", async () => {
        const share = jest.fn().mockResolvedValue(undefined);
        const writeText = jest.fn();

        await expect(
            shareLink(TARGET, { share, clipboard: { writeText } }),
        ).resolves.toBe("shared");
        expect(share).toHaveBeenCalledWith(TARGET);
        expect(writeText).not.toHaveBeenCalled();
    });

    it("should copy the link when there is no share sheet", async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);

        await expect(
            shareLink(TARGET, { clipboard: { writeText } }),
        ).resolves.toBe("copied");
        expect(writeText).toHaveBeenCalledWith(TARGET.url);
    });

    it("should do nothing more when the share sheet is dismissed", async () => {
        const share = jest
            .fn()
            .mockRejectedValue(new DOMException("dismissed", "AbortError"));
        const writeText = jest.fn();

        await expect(
            shareLink(TARGET, { share, clipboard: { writeText } }),
        ).resolves.toBe("cancelled");
        expect(writeText).not.toHaveBeenCalled();
    });

    it("should fall back to copying when the share sheet fails", async () => {
        const share = jest
            .fn()
            .mockRejectedValue(new DOMException("denied", "NotAllowedError"));
        const writeText = jest.fn().mockResolvedValue(undefined);

        await expect(
            shareLink(TARGET, { share, clipboard: { writeText } }),
        ).resolves.toBe("copied");
    });

    it("should report a failure when the clipboard refuses", async () => {
        const writeText = jest.fn().mockRejectedValue(new Error("denied"));

        await expect(
            shareLink(TARGET, { clipboard: { writeText } }),
        ).resolves.toBe("failed");
    });

    it("should report a failure when neither is available", async () => {
        await expect(shareLink(TARGET, {})).resolves.toBe("failed");
    });
});
