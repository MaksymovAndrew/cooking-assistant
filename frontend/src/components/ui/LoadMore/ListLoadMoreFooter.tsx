import { useTranslation } from "react-i18next";

import { PAGE_SIZE } from "constants/pagination";

import { LoadMore } from "./LoadMore";

interface ListLoadMoreFooterProps {
    total: number;
    loadedCount: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    loadMoreError: string | null;
}

// standard paginated-list footer: wires LoadMore to the shared i18n labels and shows the "Showing X of Y" counter only once the list exceeds one page
export const ListLoadMoreFooter = ({
    total,
    loadedCount,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loadMoreError,
}: ListLoadMoreFooterProps) => {
    const { t } = useTranslation();

    return (
        <LoadMore
            hasMore={hasNextPage}
            isLoading={isFetchingNextPage}
            onLoadMore={fetchNextPage}
            loadMoreLabel={t("loadMore.button")}
            loadingLabel={t("loadMore.loading")}
            countLabel={
                total > PAGE_SIZE
                    ? t("loadMore.showing", { loaded: loadedCount, total })
                    : undefined
            }
            errorMessage={loadMoreError ?? undefined}
        />
    );
};
