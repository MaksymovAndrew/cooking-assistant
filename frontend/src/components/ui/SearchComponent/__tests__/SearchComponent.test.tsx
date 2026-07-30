import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SearchComponent } from "components/ui/SearchComponent";

const PLACEHOLDER = "ingredient";
const QUERY = "egg";
const RESET_SEARCH = "Reset Search";

describe("SearchComponent", () => {
    it("should show the reset button after typing a search term", async () => {
        render(
            <SearchComponent
                placeholder={PLACEHOLDER}
                value=""
                onSubmit={jest.fn()}
            />,
        );

        const input = screen.getByPlaceholderText(`Search by ${PLACEHOLDER}`);

        await userEvent.type(input, QUERY);

        expect(input).toHaveValue(QUERY);
        expect(
            screen.getByRole("button", { name: RESET_SEARCH }),
        ).toBeInTheDocument();
    });

    it("should submit the typed search term on Enter", async () => {
        const onSubmit = jest.fn();

        render(
            <SearchComponent
                placeholder={PLACEHOLDER}
                value=""
                onSubmit={onSubmit}
            />,
        );

        await userEvent.type(
            screen.getByPlaceholderText(`Search by ${PLACEHOLDER}`),
            `${QUERY}{Enter}`,
        );

        expect(onSubmit).toHaveBeenCalledWith(QUERY);
    });

    it("should submit an empty term when the reset button is clicked", async () => {
        const onSubmit = jest.fn();

        render(
            <SearchComponent
                placeholder={PLACEHOLDER}
                value=""
                onSubmit={onSubmit}
            />,
        );

        const input = screen.getByPlaceholderText(`Search by ${PLACEHOLDER}`);

        await userEvent.type(input, QUERY);
        await userEvent.click(
            screen.getByRole("button", { name: RESET_SEARCH }),
        );

        expect(input).toHaveValue("");
        expect(onSubmit).toHaveBeenLastCalledWith("");
        expect(
            screen.queryByRole("button", { name: RESET_SEARCH }),
        ).not.toBeInTheDocument();
    });

    it("should resync the input when the committed value is cleared from outside", () => {
        const { rerender } = render(
            <SearchComponent
                placeholder={PLACEHOLDER}
                value={QUERY}
                onSubmit={jest.fn()}
            />,
        );

        const input = screen.getByPlaceholderText(`Search by ${PLACEHOLDER}`);

        expect(input).toHaveValue(QUERY);

        rerender(
            <SearchComponent
                placeholder={PLACEHOLDER}
                value=""
                onSubmit={jest.fn()}
            />,
        );

        expect(input).toHaveValue("");
    });
});
