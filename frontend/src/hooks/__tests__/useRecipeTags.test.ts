import { act } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { useRecipeTags } from "hooks/useRecipeTags";

import { mockedPut, mockGetByUrl } from "test/apiClientMock";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");

const RECIPE_ID = 4;
const QUICK = { id: 1, name: "Quick" };
const SLOW = { id: 2, name: "Slow" };

describe("useRecipeTags", () => {
    it("should keep both changes when two tags are toggled in one tick", () => {
        mockGetByUrl({ [API_ROUTES.tags.list]: [QUICK, SLOW] });
        mockedPut.mockResolvedValue({ data: null });

        const { result } = renderHookWithStore(() =>
            useRecipeTags(RECIPE_ID, []),
        );

        act(() => {
            result.current.toggleTag(QUICK.id);
            result.current.toggleTag(SLOW.id);
        });

        expect(mockedPut).toHaveBeenLastCalledWith(
            API_ROUTES.recipes.tags(RECIPE_ID),
            { tag_ids: [QUICK.id, SLOW.id] },
        );
        expect(result.current.selectedIds).toEqual([QUICK.id, SLOW.id]);
    });
});
