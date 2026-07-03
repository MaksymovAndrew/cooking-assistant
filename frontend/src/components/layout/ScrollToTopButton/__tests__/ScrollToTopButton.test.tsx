import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ScrollToTopButton } from "components/layout/ScrollToTopButton";

import { renderWithProviders } from "test/router";

const BUTTON_NAME = "Scroll to top";

const stubMatchMedia = (matches: boolean): void => {
    window.matchMedia = (query: string): MediaQueryList => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    });
};

const scrollTo = (value: number) => {
    Object.defineProperty(window, "scrollY", {
        configurable: true,
        value,
    });
    fireEvent.scroll(window);
};

describe("ScrollToTopButton", () => {
    afterEach(() => {
        Object.defineProperty(window, "scrollY", {
            configurable: true,
            value: 0,
        });
    });

    it("should render nothing before the page is scrolled", () => {
        const { container } = renderWithProviders(<ScrollToTopButton />);

        expect(container).toBeEmptyDOMElement();
    });

    it("should appear once the page is scrolled past the reveal threshold", () => {
        renderWithProviders(<ScrollToTopButton />);

        scrollTo(500);

        expect(
            screen.getByRole("button", { name: BUTTON_NAME }),
        ).toBeInTheDocument();
    });

    it("should disappear again once scrolled back above the threshold", () => {
        renderWithProviders(<ScrollToTopButton />);

        scrollTo(500);
        scrollTo(0);

        expect(
            screen.queryByRole("button", { name: BUTTON_NAME }),
        ).not.toBeInTheDocument();
    });

    it("should smooth-scroll to top when clicked", async () => {
        stubMatchMedia(false);
        window.scrollTo = jest.fn();
        renderWithProviders(<ScrollToTopButton />);

        scrollTo(500);
        await userEvent.click(
            screen.getByRole("button", { name: BUTTON_NAME }),
        );

        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 0,
            behavior: "smooth",
        });
    });

    it("should jump to top without animation when reduced motion is preferred", async () => {
        stubMatchMedia(true);
        window.scrollTo = jest.fn();
        renderWithProviders(<ScrollToTopButton />);

        scrollTo(500);
        await userEvent.click(
            screen.getByRole("button", { name: BUTTON_NAME }),
        );

        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 0,
            behavior: "auto",
        });
    });
});
