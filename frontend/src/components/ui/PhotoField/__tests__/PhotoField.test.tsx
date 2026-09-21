import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PhotoField } from "components/ui/PhotoField";

const renderPhotoField = (src: string | null, error: string | null = null) => {
    const onChoose = jest.fn();
    const onRemove = jest.fn();

    render(
        <PhotoField
            src={src}
            alt="Recipe photo"
            error={error}
            onChoose={onChoose}
            onRemove={onRemove}
        />,
    );

    return { onChoose, onRemove };
};

describe("PhotoField", () => {
    it("should offer to add a photo when there is none", () => {
        renderPhotoField(null);

        expect(
            screen.getByRole("button", { name: "Add a photo" }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Remove photo" }),
        ).not.toBeInTheDocument();
    });

    it("should hand a picked file to onChoose", async () => {
        const user = userEvent.setup();
        const { onChoose } = renderPhotoField(null);
        const file = new File(["image"], "dish.png", { type: "image/png" });

        await user.upload(screen.getByTestId("photo-input"), file);

        expect(onChoose).toHaveBeenCalledWith(file);
    });

    it("should preview the current photo and offer to replace or remove it", async () => {
        const user = userEvent.setup();
        const { onRemove } = renderPhotoField("blob:test/photo");

        expect(screen.getByAltText("Recipe photo")).toHaveAttribute(
            "src",
            "blob:test/photo",
        );
        expect(
            screen.getByRole("button", { name: "Replace photo" }),
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Remove photo" }));

        expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("should announce a rejected file", () => {
        renderPhotoField(null, "This file is too large");

        expect(screen.getByRole("alert")).toHaveTextContent(
            "This file is too large",
        );
    });
});
