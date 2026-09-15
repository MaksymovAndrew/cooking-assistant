import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FavouriteButton } from "components/ui/FavouriteButton";

const LABEL = "Favourite";

const makeFavourite = (isFavourite: boolean, isDisabled = false) => ({
    isFavourite,
    isDisabled,
    toggle: jest.fn().mockResolvedValue(undefined),
});

describe("FavouriteButton", () => {
    it("should expose the favourite state through aria-pressed", () => {
        render(
            <FavouriteButton
                favourite={makeFavourite(true)}
                label={LABEL}
                iconSize={16}
                className="hero"
            />,
        );

        expect(screen.getByRole("button", { name: LABEL })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByRole("button", { name: LABEL })).toHaveClass(
            "hero",
            "favourite-button--active",
        );
    });

    it("should not mark an unfavourited button as active", () => {
        render(
            <FavouriteButton
                favourite={makeFavourite(false)}
                label={LABEL}
                iconSize={16}
                className="hero"
            />,
        );

        expect(screen.getByRole("button", { name: LABEL })).toHaveAttribute(
            "aria-pressed",
            "false",
        );
        expect(screen.getByRole("button", { name: LABEL })).not.toHaveClass(
            "favourite-button--active",
        );
    });

    it("should toggle on press and render its visible label", async () => {
        const favourite = makeFavourite(false);

        render(
            <FavouriteButton
                favourite={favourite}
                label={LABEL}
                iconSize={16}
                className="hero"
            >
                Favourite
            </FavouriteButton>,
        );

        await userEvent.click(screen.getByRole("button", { name: LABEL }));

        expect(favourite.toggle).toHaveBeenCalledTimes(1);
        expect(screen.getByText("Favourite")).toBeInTheDocument();
    });

    it("should be disabled while the toggle says so", () => {
        render(
            <FavouriteButton
                favourite={makeFavourite(false, true)}
                label={LABEL}
                iconSize={16}
                className="hero"
            />,
        );

        expect(screen.getByRole("button", { name: LABEL })).toBeDisabled();
    });
});
