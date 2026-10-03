import { useMemo, useRef, useState } from "react";

import type { Tag } from "types/tag";

import {
    useCreateTagMutation,
    useGetTagsQuery,
    useSetRecipeTagsMutation,
} from "redux/services/tagsApi";

import { ignoreRejection } from "utils/ignoreRejection";

// a failed write is reverted here and toasted by the global listener

// a save not known to have failed; request 0 is the selection the page was rendered with
interface StandingSave {
    request: number;
    ids: number[];
}

// the page is server-rendered, so the assignment lives here; the catalog is cached, so a rename shows at once
export const useRecipeTags = (recipeId: number, initialTags: Tag[]) => {
    const { data: tags = [], isSuccess } = useGetTagsQuery(null);
    const [setRecipeTags] = useSetRecipeTagsMutation();
    const [createTag] = useCreateTagMutation();
    const [selectedIds, setSelectedIds] = useState(() =>
        initialTags.map((tag) => tag.id),
    );
    // the endpoint replaces the whole set, so two quick taps must not both start from one render's selection
    const savesRef = useRef<StandingSave[]>([{ request: 0, ids: selectedIds }]);
    const requestCountRef = useRef(0);

    const selectedTags = useMemo(
        () => tags.filter((tag) => selectedIds.includes(tag.id)),
        [tags, selectedIds],
    );

    const newestIds = (): number[] =>
        savesRef.current[savesRef.current.length - 1].ids;

    const persist = (ids: number[]) => {
        requestCountRef.current += 1;
        const sent = { request: requestCountRef.current, ids };

        savesRef.current = [...savesRef.current, sent];
        setSelectedIds(ids);
        setRecipeTags({ recipeId, tagIds: ids })
            .unwrap()
            .then(() => {
                // the server is past every save sent before this one
                savesRef.current = savesRef.current.filter(
                    (save) => save.request >= sent.request,
                );
            })
            .catch(() => {
                // saves settle in any order, so only a failed newest one changes the screen
                savesRef.current = savesRef.current.filter(
                    (save) => save !== sent,
                );
                setSelectedIds(newestIds());
            });
    };

    // a deleted tag leaves its id behind, and a save carrying one the account no longer owns is refused whole
    const ownedSelection = (): number[] =>
        isSuccess
            ? newestIds().filter((id) => tags.some((tag) => tag.id === id))
            : newestIds();

    const toggleTag = (tagId: number) => {
        const current = ownedSelection();

        persist(
            current.includes(tagId)
                ? current.filter((id) => id !== tagId)
                : [...current, tagId],
        );
    };

    // a tag created from the recipe page is meant for it, so it is attached right away
    const addTag = (name: string) => {
        createTag(name)
            .unwrap()
            .then((tag) => {
                persist([...ownedSelection(), tag.id]);
            })
            .catch(ignoreRejection);
    };

    return { tags, selectedIds, selectedTags, toggleTag, addTag };
};
