import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BaseModal } from "components/modals/BaseModal";

const MESSAGE = "Modal content";

describe("BaseModal", () => {
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

    it("should be named by its label when it shows no title", () => {
        render(
            <BaseModal onClose={jest.fn()} ariaLabel="Photo preview">
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        const dialog = screen.getByRole("dialog", { name: "Photo preview" });

        expect(dialog).not.toHaveAttribute("aria-labelledby");
    });

    it("should render outside the page that mounts it, so the page can go inert", () => {
        const { container } = render(
            <BaseModal onClose={jest.fn()} title="Heading">
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        expect(container).not.toContainElement(screen.getByRole("dialog"));
    });

    it("should call onClose when Escape is pressed", async () => {
        const onClose = jest.fn();

        render(
            <BaseModal onClose={onClose} title="Heading">
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        await userEvent.keyboard("{Escape}");

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose on Escape when closeOnEscape is false", async () => {
        const onClose = jest.fn();

        render(
            <BaseModal onClose={onClose} title="Heading" closeOnEscape={false}>
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        await userEvent.keyboard("{Escape}");

        expect(onClose).not.toHaveBeenCalled();
    });

    it("should call onClose when the overlay is clicked", async () => {
        const onClose = jest.fn();

        render(
            <BaseModal onClose={onClose} title="Heading">
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        await userEvent.click(screen.getByRole("presentation"));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose when clicking inside the dialog", async () => {
        const onClose = jest.fn();

        render(
            <BaseModal onClose={onClose} title="Heading">
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        await userEvent.click(screen.getByText(MESSAGE));

        expect(onClose).not.toHaveBeenCalled();
    });

    it("should not call onClose on overlay click when closeOnOverlay is false", async () => {
        const onClose = jest.fn();

        render(
            <BaseModal onClose={onClose} title="Heading" closeOnOverlay={false}>
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        await userEvent.click(screen.getByRole("presentation"));

        expect(onClose).not.toHaveBeenCalled();
    });

    it("should lock body scroll while mounted and restore it on unmount", () => {
        const { unmount } = render(
            <BaseModal onClose={jest.fn()} title="Heading">
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        expect(document.body.style.overflow).toBe("hidden");

        unmount();

        expect(document.body.style.overflow).toBe("");
    });

    it("should not render a close button by default", () => {
        render(
            <BaseModal onClose={jest.fn()} title="Heading">
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        expect(
            screen.queryByRole("button", { name: "Close" }),
        ).not.toBeInTheDocument();
    });

    it("should call onClose when the close button is clicked", async () => {
        const onClose = jest.fn();

        render(
            <BaseModal onClose={onClose} title="Heading" showCloseButton>
                <p>{MESSAGE}</p>
            </BaseModal>,
        );

        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    describe("on a mobile viewport", () => {
        const originalMatchMedia = window.matchMedia;

        beforeEach(() => {
            window.matchMedia = (query: string): MediaQueryList => ({
                matches: true,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            });
        });

        afterEach(() => {
            window.matchMedia = originalMatchMedia;
        });

        it("should call onClose when the drag handle is clicked", async () => {
            const onClose = jest.fn();

            render(
                <BaseModal onClose={onClose} title="Heading">
                    <p>{MESSAGE}</p>
                </BaseModal>,
            );

            await userEvent.click(
                screen.getByRole("button", { name: "Close" }),
            );

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
