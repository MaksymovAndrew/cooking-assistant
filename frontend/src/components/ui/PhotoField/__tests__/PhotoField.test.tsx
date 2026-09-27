import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PhotoField } from "components/ui/PhotoField";

const PHOTO_ALT = "Recipe photo";
const PHOTO_SRC = "blob:test/photo";
const REMOVE_PHOTO = "Remove photo";

const renderPhotoField = (src: string | null, error: string | null = null) => {
    const onChoose = jest.fn();
    const onRemove = jest.fn();

    render(
        <PhotoField
            src={src}
            alt={PHOTO_ALT}
            error={error}
            onChoose={onChoose}
            onRemove={onRemove}
        />,
    );

    return { onChoose, onRemove };
};

const photo = new File(["image"], "dish.png", { type: "image/png" });
const withFiles = { dataTransfer: { types: ["Files"], files: [photo] } };

describe("PhotoField", () => {
    it("should offer the whole frame as a drop zone when there is no photo", () => {
        renderPhotoField(null);

        expect(
            screen.getByRole("button", {
                name: "Add a photo or drag one here",
            }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: REMOVE_PHOTO }),
        ).not.toBeInTheDocument();
    });

    it("should open the file picker when the empty frame is clicked", async () => {
        const user = userEvent.setup();

        renderPhotoField(null);
        const input = screen.getByTestId("photo-input");
        const openPicker = jest.spyOn(input, "click");

        await user.click(screen.getByRole("button", { name: /Add a photo/ }));

        expect(openPicker).toHaveBeenCalledTimes(1);
    });

    it("should hand a picked file to onChoose", async () => {
        const user = userEvent.setup();
        const { onChoose } = renderPhotoField(null);

        await user.upload(screen.getByTestId("photo-input"), photo);

        expect(onChoose).toHaveBeenCalledWith(photo);
    });

    it("should hand a dropped file to onChoose", () => {
        const { onChoose } = renderPhotoField(null);
        const dropzone = screen.getByRole("button", { name: /Add a photo/ });

        fireEvent.dragEnter(dropzone, withFiles);

        expect(dropzone).toHaveTextContent("Drop the photo here");

        fireEvent.drop(dropzone, withFiles);

        expect(onChoose).toHaveBeenCalledWith(photo);
    });

    it("should preview the current photo and offer to replace or remove it", async () => {
        const user = userEvent.setup();
        const { onRemove } = renderPhotoField(PHOTO_SRC);

        expect(screen.getByAltText(PHOTO_ALT)).toHaveAttribute(
            "src",
            PHOTO_SRC,
        );
        expect(
            screen.getByRole("button", { name: "Replace photo" }),
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: REMOVE_PHOTO }));

        expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("should replace the photo with one dropped over it", () => {
        const { onChoose } = renderPhotoField(PHOTO_SRC);
        // a drag over the image bubbles up to the frame that takes the drop
        const image = screen.getByAltText(PHOTO_ALT);

        fireEvent.dragEnter(image, withFiles);

        expect(
            screen.getByText("Drop to replace the photo"),
        ).toBeInTheDocument();

        fireEvent.drop(image, withFiles);

        expect(onChoose).toHaveBeenCalledWith(photo);
        expect(
            screen.queryByText("Drop to replace the photo"),
        ).not.toBeInTheDocument();
    });

    it("should move focus to the empty frame once the photo is removed", async () => {
        const user = userEvent.setup();
        const props = {
            alt: PHOTO_ALT,
            error: null,
            onChoose: jest.fn(),
            onRemove: jest.fn(),
        };
        const { rerender } = render(<PhotoField {...props} src={PHOTO_SRC} />);

        await user.click(screen.getByRole("button", { name: REMOVE_PHOTO }));
        rerender(<PhotoField {...props} src={null} />);

        expect(
            screen.getByRole("button", { name: /Add a photo/ }),
        ).toHaveFocus();
    });

    it("should announce a rejected file", () => {
        renderPhotoField(null, "This file is too large");

        expect(screen.getByRole("alert")).toHaveTextContent(
            "This file is too large",
        );
    });
});
