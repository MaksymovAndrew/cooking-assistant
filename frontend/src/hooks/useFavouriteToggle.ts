import { useState } from "react";

import type { FavouriteTarget } from "constants/favourites";

import {
    useAddFavouriteMutation,
    useRemoveFavouriteMutation,
} from "redux/services/favouritesApi";

import { useIsHydrated } from "hooks/useIsHydrated";

export interface FavouriteToggle {
    isFavourite: boolean;
    isDisabled: boolean;
    // settles once the request does; a failure is already handled by flipping back
    toggle: () => Promise<void>;
}

interface Override {
    base: boolean;
    value: boolean;
}

// optimistic: the heart flips on press and flips back if the request fails. A detail page gets its record
// as server props with no cache entry to refetch, so the flip is what it keeps showing; on a list, the
// refetch the mutation triggers brings a new server value, which replaces the flip
export const useFavouriteToggle = (
    target: FavouriteTarget,
    id: number,
    serverValue: boolean,
): FavouriteToggle => {
    // the button is on screen from the server render; a press before hydration would be swallowed
    const isHydrated = useIsHydrated();
    const [addFavourite, addState] = useAddFavouriteMutation();
    const [removeFavourite, removeState] = useRemoveFavouriteMutation();
    const [override, setOverride] = useState<Override | null>(null);

    // a new server value supersedes the flip for good - kept around, the flip would resurface the
    // moment the server value happened to swing back to the one it was made against
    if (override !== null && override.base !== serverValue) {
        setOverride(null);
    }

    const isFavourite =
        override?.base === serverValue ? override.value : serverValue;
    const isPending = addState.isLoading || removeState.isLoading;

    const toggle = async () => {
        const next = !isFavourite;
        const request = next ? addFavourite : removeFavourite;

        setOverride({ base: serverValue, value: next });

        try {
            await request({ target, id }).unwrap();
        } catch {
            setOverride({ base: serverValue, value: isFavourite });
        }
    };

    return {
        isFavourite,
        isDisabled: !isHydrated || isPending,
        toggle,
    };
};
