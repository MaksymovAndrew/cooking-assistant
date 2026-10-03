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

// optimistic: a detail page has no cache entry to refetch, so the flip is what it keeps showing
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

    // dropped for good, or the flip would resurface if the server value swung back to its base
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
