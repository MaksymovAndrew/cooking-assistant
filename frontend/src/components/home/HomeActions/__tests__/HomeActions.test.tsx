import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HomeActions } from "components/home/HomeActions";

import { renderWithRouter } from "test/router";

describe("HomeActions", () => {
    it("should call onOpenNews when the news button is clicked", async () => {
        const onOpenNews = jest.fn();

        renderWithRouter(<HomeActions onOpenNews={onOpenNews} />);

        await userEvent.click(screen.getByRole("button", { name: "News" }));

        expect(onOpenNews).toHaveBeenCalledTimes(1);
    });

    it("should link to the add-menu and add-recipe pages", () => {
        renderWithRouter(<HomeActions onOpenNews={jest.fn()} />);

        expect(screen.getByRole("link", { name: "New menu" })).toHaveAttribute(
            "href",
            "/add-menu",
        );
        expect(
            screen.getByRole("link", { name: "New recipe" }),
        ).toHaveAttribute("href", "/add-recipe");
    });
});
