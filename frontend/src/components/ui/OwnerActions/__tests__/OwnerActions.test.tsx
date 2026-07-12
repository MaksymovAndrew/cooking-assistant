import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OwnerActions } from "components/ui/OwnerActions";

import { renderWithRouter } from "test/router";

describe("OwnerActions", () => {
    it("should link to the edit target and render the delete button", () => {
        renderWithRouter(
            <OwnerActions
                editTo="/change-recipe/5"
                onDelete={jest.fn()}
                editLabel="Edit"
                deleteLabel="Delete"
                favouriteLabel="Favourite"
            />,
        );

        expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
            "href",
            "/change-recipe/5",
        );
        expect(
            screen.getByRole("button", { name: "Delete" }),
        ).toBeInTheDocument();
    });

    it("should call onDelete when the delete button is clicked", async () => {
        const onDelete = jest.fn();

        renderWithRouter(
            <OwnerActions
                editTo="/change-recipe/5"
                onDelete={onDelete}
                editLabel="Edit"
                deleteLabel="Delete"
                favouriteLabel="Favourite"
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Delete" }));

        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});
