import type { RecipeListItem } from "types/recipe";

import { flattenPages } from "redux/services/infiniteQueryHelpers";
import { useGetRecipesByFiltersInfiniteQuery } from "redux/services/recipesApi";

import { ignoreRejection } from "utils/ignoreRejection";

export const useRecipePickerSearch = (query: string, selectedIds: number[]) => {
    const { data, hasNextPage, isFetching, fetchNextPage } =
        useGetRecipesByFiltersInfiniteQuery(
            { recipe_name: query },
            { skip: query === "" },
        );
    const matches: RecipeListItem[] = flattenPages(data).filter(
        (recipe) => !selectedIds.includes(recipe.id),
    );

    return {
        matches,
        isSearching: isFetching,
        hasMore: hasNextPage,
        loadMore: () => {
            fetchNextPage().catch(ignoreRejection);
        },
    };
};
