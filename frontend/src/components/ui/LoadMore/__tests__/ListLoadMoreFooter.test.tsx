import { render, screen } from "@testing-library/react";

import { PAGE_SIZE } from "constants/pagination";

import { ListLoadMoreFooter } from "components/ui/LoadMore";

const footer = (total: number) => (
    <ListLoadMoreFooter
        total={total}
        loadedCount={PAGE_SIZE}
        hasNextPage={total > PAGE_SIZE}
        isFetchingNextPage={false}
        fetchNextPage={jest.fn()}
        loadMoreError={null}
    />
);

describe("ListLoadMoreFooter", () => {
    it("should count what is shown only once the list runs past one page", () => {
        const { rerender } = render(footer(PAGE_SIZE));

        expect(screen.queryByText(/^Showing/)).not.toBeInTheDocument();

        rerender(footer(PAGE_SIZE + 1));

        expect(
            screen.getByText(`Showing ${PAGE_SIZE} of ${PAGE_SIZE + 1}`),
        ).toBeInTheDocument();
    });
});
