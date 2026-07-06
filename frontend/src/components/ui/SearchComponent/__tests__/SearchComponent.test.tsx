import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSearchParams } from "react-router-dom";

import { SEARCH_PARAM_INGREDIENT_NAME } from "constants/queryParams";

import { SearchComponent } from "components/ui/SearchComponent";

import { ROUTE_ALL_MENUS } from "test/constants";
import { renderWithRouter } from "test/router";

const PLACEHOLDER = "ingredient";
const QUERY = "egg";
const RESET_SEARCH = "Reset Search";

// probes the URL search param the component writes, so a test can assert the
// search was actually applied (not merely that the input kept its value)
const ActiveFilter = () => {
    const [params] = useSearchParams();

    return (
        <div>{`filter:${params.get(SEARCH_PARAM_INGREDIENT_NAME) ?? ""}`}</div>
    );
};

describe("SearchComponent", () => {
    it("should show the reset button after typing a search term", async () => {
        renderWithRouter(<SearchComponent placeholder={PLACEHOLDER} />, [
            ROUTE_ALL_MENUS,
        ]);

        const input = screen.getByPlaceholderText(`Search by ${PLACEHOLDER}`);

        await userEvent.type(input, QUERY);

        expect(input).toHaveValue(QUERY);
        expect(
            screen.getByRole("button", { name: RESET_SEARCH }),
        ).toBeInTheDocument();
    });

    it("should write the search term to the URL on Enter", async () => {
        renderWithRouter(
            <>
                <SearchComponent placeholder={PLACEHOLDER} />
                <ActiveFilter />
            </>,
            [ROUTE_ALL_MENUS],
        );

        await userEvent.type(
            screen.getByPlaceholderText(`Search by ${PLACEHOLDER}`),
            `${QUERY}{Enter}`,
        );

        expect(screen.getByText(`filter:${QUERY}`)).toBeInTheDocument();
    });

    it("should clear the search term when the reset button is clicked", async () => {
        renderWithRouter(<SearchComponent placeholder={PLACEHOLDER} />, [
            ROUTE_ALL_MENUS,
        ]);

        const input = screen.getByPlaceholderText(`Search by ${PLACEHOLDER}`);

        await userEvent.type(input, QUERY);
        await userEvent.click(
            screen.getByRole("button", { name: RESET_SEARCH }),
        );

        expect(input).toHaveValue("");
        expect(
            screen.queryByRole("button", { name: RESET_SEARCH }),
        ).not.toBeInTheDocument();
    });
});
