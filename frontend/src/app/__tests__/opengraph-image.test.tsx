import { render, screen } from "@testing-library/react";
import { ImageResponse } from "next/og";

import SiteSocialImage, { generateImageMetadata } from "app/opengraph-image";

jest.mock("next/og", () => ({ ImageResponse: jest.fn() }));

describe("site preview image", () => {
    it("should describe the card by the app's name", async () => {
        const [entry] = await generateImageMetadata();

        expect(entry.alt).toBe("Cooking Assistant");
    });

    it("should show what the app is for", async () => {
        await SiteSocialImage();
        const [card] = jest.mocked(ImageResponse).mock.calls[0];

        render(card);

        expect(
            screen.getByText("Recipes, menus and your pantry in one kitchen"),
        ).toBeInTheDocument();
        expect(screen.getByText("Shopping")).toBeInTheDocument();
    });
});
