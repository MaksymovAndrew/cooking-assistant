import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";

import { renderSocialImage, socialImageEntry } from "app/socialImage";

jest.mock("next/og", () => ({ ImageResponse: jest.fn() }));
jest.mock("node:fs/promises", () => ({ readFile: jest.fn() }));

const mockedReadFile = readFile as jest.MockedFunction<typeof readFile>;

describe("socialImage", () => {
    beforeEach(() => {
        mockedReadFile.mockResolvedValue(Buffer.from("font"));
    });

    // runs first: the fonts are read once per process, so later tests find them loaded
    it("should read the fonts again after a failed read instead of keeping the failure", async () => {
        mockedReadFile.mockRejectedValueOnce(new Error("disk unavailable"));

        await expect(renderSocialImage(<div />)).rejects.toThrow(
            "disk unavailable",
        );
        await renderSocialImage(<div />);

        expect(ImageResponse).toHaveBeenCalledTimes(1);
    });

    it("should render at the link preview size with the brand fonts", async () => {
        await renderSocialImage(<div />);

        const [, options] = jest.mocked(ImageResponse).mock.calls[0];

        expect(options).toEqual(
            expect.objectContaining({ width: 1200, height: 630 }),
        );
        expect(options?.fonts?.map(({ name }) => name)).toEqual([
            "Fraunces",
            "Inter",
            "Inter",
        ]);
    });

    it("should read the fonts only once", async () => {
        await renderSocialImage(<div />);
        await renderSocialImage(<div />);

        expect(mockedReadFile).not.toHaveBeenCalled();
    });

    it("should describe a generated card so its size and type tags are emitted", () => {
        expect(socialImageEntry("A recipe card")).toEqual({
            id: "card",
            alt: "A recipe card",
            size: { width: 1200, height: 630 },
            contentType: "image/png",
        });
    });
});
