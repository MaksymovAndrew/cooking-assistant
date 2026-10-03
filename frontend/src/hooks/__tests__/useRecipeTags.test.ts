import { act } from "@testing-library/react";

import type { Tag } from "types/tag";

import { API_ROUTES } from "api/endpoints";

import { tagsApi } from "redux/services/tagsApi";

import { useRecipeTags } from "hooks/useRecipeTags";

import {
    makeAxiosError,
    mockedPost,
    mockedPut,
    mockGetByUrl,
} from "test/apiClientMock";
import { MOCK_ERROR_SERVER } from "test/constants";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const RECIPE_ID = 4;
const QUICK: Tag = { id: 1, name: "Quick" };
const SLOW: Tag = { id: 2, name: "Slow" };
// still on the server-rendered recipe, but deleted from the account since
const DELETED: Tag = { id: 3, name: "Leftovers" };
const SAVE_FAILED = makeAxiosError(500, MOCK_ERROR_SERVER);

// one save the test settles itself, so a later one can overtake it
const holdNextSave = () => {
    const save: { fail: (reason: unknown) => void; succeed: () => void } = {
        fail: () => undefined,
        succeed: () => undefined,
    };

    mockedPut.mockImplementationOnce(
        () =>
            new Promise((resolve, reject) => {
                save.fail = reject;
                save.succeed = () => {
                    resolve({ data: null });
                };
            }),
    );

    return save;
};

// runs the step, then lets every save it settled reach the hook
const settle = (step: () => void) =>
    act(async () => {
        step();
        await Promise.resolve();
    });

const renderTags = () => {
    mockGetByUrl({ [API_ROUTES.tags.list]: [QUICK, SLOW] });

    return renderHookWithStore(() => useRecipeTags(RECIPE_ID, []));
};

describe("useRecipeTags", () => {
    it("should keep both changes when two tags are toggled in one tick", () => {
        mockedPut.mockResolvedValue({ data: null });

        const { result } = renderTags();

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

    it("should leave a tag deleted elsewhere out of the next save", async () => {
        mockGetByUrl({ [API_ROUTES.tags.list]: [QUICK, SLOW] });
        mockedPut.mockResolvedValue({ data: null });
        const store = makeTestStore();

        await store.dispatch(tagsApi.endpoints.getTags.initiate(null));

        const { result } = renderHookWithStore(
            () => useRecipeTags(RECIPE_ID, [QUICK, DELETED]),
            store,
        );

        act(() => {
            result.current.toggleTag(SLOW.id);
        });

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.tags(RECIPE_ID),
            { tag_ids: [QUICK.id, SLOW.id] },
        );
    });

    it("should go back to the last saved tags when the newest save fails", async () => {
        mockedPut
            .mockResolvedValueOnce({ data: null })
            .mockRejectedValueOnce(SAVE_FAILED);

        const { result } = renderTags();

        await settle(() => {
            result.current.toggleTag(QUICK.id);
        });
        await settle(() => {
            result.current.toggleTag(SLOW.id);
        });

        expect(result.current.selectedIds).toEqual([QUICK.id]);
    });

    it("should keep a newer save on screen when an older one fails after it was sent", async () => {
        const olderSave = holdNextSave();

        mockedPut.mockReturnValue(new Promise(() => undefined));

        const { result } = renderTags();

        act(() => {
            result.current.toggleTag(QUICK.id);
        });
        act(() => {
            result.current.toggleTag(SLOW.id);
        });
        await settle(() => {
            olderSave.fail(SAVE_FAILED);
        });

        expect(result.current.selectedIds).toEqual([QUICK.id, SLOW.id]);
    });

    it("should end on an older save the server kept when a newer one failed first", async () => {
        const olderSave = holdNextSave();

        mockedPut.mockRejectedValueOnce(SAVE_FAILED);

        const { result } = renderTags();

        act(() => {
            result.current.toggleTag(QUICK.id);
        });
        await settle(() => {
            result.current.toggleTag(SLOW.id);
        });
        await settle(() => {
            olderSave.succeed();
        });

        expect(result.current.selectedIds).toEqual([QUICK.id]);
    });

    it("should attach nothing when the new tag cannot be created", async () => {
        mockedPost.mockRejectedValue(SAVE_FAILED);

        const { result } = renderTags();

        await settle(() => {
            result.current.addTag("Weekend");
        });

        expect(mockedPut).not.toHaveBeenCalled();
        expect(result.current.selectedIds).toEqual([]);
    });
});
