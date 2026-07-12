import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BaseModal } from "components/modals/BaseModal";

const MESSAGE = "Modal content";

describe("BaseModal", () => {
    it("should render the title and children", () => {
        render(
            <BaseModal onClose={jest.fn()} title="Heading">
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        expect(screen.getByText("Heading")).toBeInTheDocument();
        expect(screen.getByText(MESSAGE)).toBeInTheDocument();
    });

    it("should set aria-labelledby on the dialog when a title is given", () => {
        render(
            <BaseModal onClose={jest.fn()} title="Heading">
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        const dialog = screen.getByRole("dialog");
        const heading = screen.getByText("Heading");

        expect(dialog).toHaveAttribute("aria-labelledby", heading.id);
    });

    it("should not set aria-labelledby when no title is given", () => {
        render(
            <BaseModal onClose={jest.fn()}>
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        expect(screen.getByRole("dialog")).not.toHaveAttribute(
            "aria-labelledby",
        );
    });

    it("should call onClose when Escape is pressed", async () => {
        const onClose = jest.fn();

        render(
            <BaseModal onClose={onClose}>
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        await userEvent.keyboard("{Escape}");

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose on Escape when closeOnEscape is false", async () => {
        const onClose = jest.fn();

        render(
            <BaseModal onClose={onClose} closeOnEscape={false}>
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        await userEvent.keyboard("{Escape}");

        expect(onClose).not.toHaveBeenCalled();
    });

    it("should call onClose when the overlay is clicked", async () => {
        const onClose = jest.fn();

        render(
            <BaseModal onClose={onClose}>
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        await userEvent.click(screen.getByRole("presentation"));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose when clicking inside the dialog", async () => {
        const onClose = jest.fn();

        render(
            <BaseModal onClose={onClose}>
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        await userEvent.click(screen.getByText(MESSAGE));

        expect(onClose).not.toHaveBeenCalled();
    });

    it("should not call onClose on overlay click when closeOnOverlay is false", async () => {
        const onClose = jest.fn();

        render(
            <BaseModal onClose={onClose} closeOnOverlay={false}>
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        await userEvent.click(screen.getByRole("presentation"));

        expect(onClose).not.toHaveBeenCalled();
    });

    it("should lock body scroll while mounted and restore it on unmount", () => {
        const { unmount } = render(
            <BaseModal onClose={jest.fn()}>
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        expect(document.body.style.overflow).toBe("hidden");

        unmount();

        expect(document.body.style.overflow).toBe("");
    });
});
