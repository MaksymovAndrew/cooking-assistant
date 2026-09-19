import { useMemo, useRef, useState } from "react";

import type { Tag } from "types/tag";

import {
    useCreateTagMutation,
    useGetTagsQuery,
    useSetRecipeTagsMutation,
} from "redux/services/tagsApi";

// a failed write is reverted here and toasted by the global listener
const ignoreRejection = () => undefined;

// the recipe page is server-rendered, so its tags arrive as props and the assignment lives here
// from then on - the tag catalog itself comes from the cache, so a rename shows up at once
export const useRecipeTags = (recipeId: number, initialTags: Tag[]) => {
    const { data: tags = [], isSuccess } = useGetTagsQuery(null);
    const [setRecipeTags] = useSetRecipeTagsMutation();
    const [createTag] = useCreateTagMutation();
    const [selectedIds, setSelectedIds] = useState(() =>
        initialTags.map((tag) => tag.id),
    );
    // the endpoint replaces the whole set, so two quick taps must not both start from the same
    // render's selection - the second would drop the first
    const selectionRef = useRef(selectedIds);

    const selectedTags = useMemo(
        () => tags.filter((tag) => selectedIds.includes(tag.id)),
        [tags, selectedIds],
    );

    const apply = (ids: number[]) => {
        selectionRef.current = ids;
        setSelectedIds(ids);
    };

    const persist = (nextIds: number[]) => {
        const previousIds = selectionRef.current;

        apply(nextIds);
        setRecipeTags({ recipeId, tagIds: nextIds })
            .unwrap()
            .catch(() => {
                apply(previousIds);
            });
    };

    // a tag deleted anywhere leaves its id behind here, and a save carrying one the account no
    // longer owns is refused whole
    const ownedSelection = (): number[] =>
        isSuccess
            ? selectionRef.current.filter((id) =>
                  tags.some((tag) => tag.id === id),
              )
            : selectionRef.current;

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
