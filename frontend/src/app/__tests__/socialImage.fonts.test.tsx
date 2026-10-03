import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";

import { renderSocialImage } from "app/socialImage";

jest.mock("next/og", () => ({ ImageResponse: jest.fn() }));
jest.mock("node:fs/promises", () => ({ readFile: jest.fn() }));

const mockedReadFile = readFile as jest.MockedFunction<typeof readFile>;

// alone in its file: the fonts are cached per module, so only a fresh one starts cold
describe("socialImage fonts", () => {
    it("should read the fonts again after a failed read, then keep them", async () => {
        mockedReadFile.mockRejectedValueOnce(new Error("disk unavailable"));
        mockedReadFile.mockResolvedValue(Buffer.from("font"));

        await expect(renderSocialImage(<div />)).rejects.toThrow(
            "disk unavailable",
        );
        await renderSocialImage(<div />);
        const readsOnceLoaded = mockedReadFile.mock.calls.length;

        await renderSocialImage(<div />);

        expect(ImageResponse).toHaveBeenCalledTimes(2);
        expect(mockedReadFile).toHaveBeenCalledTimes(readsOnceLoaded);
    });
});
