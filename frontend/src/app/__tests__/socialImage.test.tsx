import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";

import { renderSocialImage } from "app/socialImage";

jest.mock("next/og", () => ({ ImageResponse: jest.fn() }));
jest.mock("node:fs/promises", () => ({ readFile: jest.fn() }));

const mockedReadFile = readFile as jest.MockedFunction<typeof readFile>;

describe("socialImage", () => {
    it("should render at the link preview size with the brand fonts", async () => {
        mockedReadFile.mockResolvedValue(Buffer.from("font"));

        await renderSocialImage(<div />);

        const [, options] = jest.mocked(ImageResponse).mock.calls[0];

        expect(options).toEqual(
            expect.objectContaining({ width: 1200, height: 630 }),
        );
        expect(options?.fonts?.map(({ name }) => name)).toEqual([
            "Fraunces",
            "Lora",
            "Inter",
            "Inter",
        ]);
    });
});
