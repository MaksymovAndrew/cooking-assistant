import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OwnerActions } from "components/ui/OwnerActions";

import { renderWithRouter } from "test/router";

const FAVOURITE = {
    isFavourite: false,
    isDisabled: false,
    toggle: jest.fn().mockResolvedValue(undefined),
};

describe("OwnerActions", () => {
    it("should link to the edit target and render the delete button", () => {
        renderWithRouter(
            <OwnerActions
                editTo="/change-recipe/5"
                onDelete={jest.fn()}
                editLabel="Edit"
                deleteLabel="Delete"
                favourite={FAVOURITE}
                favouriteLabel="Favourite"
                shareTitle="Borscht"
            />,
        );

        expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
            "href",
            "/change-recipe/5",
        );
        expect(
            screen.getByRole("button", { name: "Delete" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Share" })).toBeEnabled();
    });

    it("should call onDelete when the delete button is clicked", async () => {
        const onDelete = jest.fn();

        renderWithRouter(
            <OwnerActions
                editTo="/change-recipe/5"
                onDelete={onDelete}
                editLabel="Edit"
                deleteLabel="Delete"
                favourite={FAVOURITE}
                favouriteLabel="Favourite"
                shareTitle="Borscht"
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Delete" }));

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("should not show a log-intake button when onLogIntake is not provided", () => {
        renderWithRouter(
            <OwnerActions
                editTo="/change-recipe/5"
                onDelete={jest.fn()}
                editLabel="Edit"
                deleteLabel="Delete"
                favourite={FAVOURITE}
                favouriteLabel="Favourite"
                shareTitle="Borscht"
            />,
        );

        expect(
            screen.queryByRole("button", { name: "Log intake" }),
        ).not.toBeInTheDocument();
    });

    it("should call onLogIntake when the log-intake button is clicked", async () => {
        const onLogIntake = jest.fn();

        renderWithRouter(
            <OwnerActions
                editTo="/change-recipe/5"
                onDelete={jest.fn()}
                editLabel="Edit"
                deleteLabel="Delete"
                favourite={FAVOURITE}
                favouriteLabel="Favourite"
                shareTitle="Borscht"
                onLogIntake={onLogIntake}
                logIntakeLabel="Log intake"
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Log intake" }),
        );

        expect(onLogIntake).toHaveBeenCalledTimes(1);
    });

    it("should call onCook when the cooked-it button is clicked", async () => {
        const onCook = jest.fn();

        renderWithRouter(
            <OwnerActions
                editTo="/change-recipe/5"
                onDelete={jest.fn()}
                editLabel="Edit"
                deleteLabel="Delete"
                favourite={FAVOURITE}
                favouriteLabel="Favourite"
                shareTitle="Borscht"
                onCook={onCook}
                cookLabel="Cooked it"
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Cooked it" }),
        );

        expect(onCook).toHaveBeenCalledTimes(1);
    });

    it("should not show a cooked-it button when onCook is not provided", () => {
        renderWithRouter(
            <OwnerActions
                editTo="/change-recipe/5"
                onDelete={jest.fn()}
                editLabel="Edit"
                deleteLabel="Delete"
                favourite={FAVOURITE}
                favouriteLabel="Favourite"
                shareTitle="Borscht"
            />,
        );

        expect(
            screen.queryByRole("button", { name: "Cooked it" }),
        ).not.toBeInTheDocument();
    });
});
