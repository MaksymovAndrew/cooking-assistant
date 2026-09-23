import { useState } from "react";

import type { RatingTarget, RecordRating } from "types/rating";

import {
    useRateRecordMutation,
    useRemoveRatingMutation,
} from "redux/services/ratingsApi";

import { useIsHydrated } from "hooks/useIsHydrated";

export interface RatingControl extends RecordRating {
    isDisabled: boolean;
    // both settle once the request does; a failure is already handled by rolling back
    rate: (value: number) => Promise<void>;
    clear: () => Promise<void>;
}

interface Override {
    base: RecordRating;
    myRating: number | null;
}

const isSameRating = (a: RecordRating, b: RecordRating): boolean =>
    a.ratingAverage === b.ratingAverage &&
    a.ratingCount === b.ratingCount &&
    a.myRating === b.myRating;

// the aggregate as it stands once the viewer's vote changes from the server's to `next`
const withVote = (server: RecordRating, next: number | null): RecordRating => {
    const hadVote = server.myRating !== null;
    const hasVote = next !== null;
    const sum =
        (server.ratingAverage ?? 0) * server.ratingCount -
        (server.myRating ?? 0) +
        (next ?? 0);
    const count = server.ratingCount - Number(hadVote) + Number(hasVote);

    return {
        ratingAverage: count > 0 ? sum / count : null,
        ratingCount: count,
        myRating: next,
    };
};

// optimistic, like useFavouriteToggle: the vote and the average move on press and roll back if the
// request fails. A detail page has no cache entry to refetch, so the local figures are what it keeps
// showing; on a list, the refetch the mutation triggers brings new server values, which replace them
export const useRatingControl = (
    target: RatingTarget,
    id: number,
    server: RecordRating,
): RatingControl => {
    // the stars are on screen from the server render; a press before hydration would be swallowed
    const isHydrated = useIsHydrated();
    const [rateRecord, rateState] = useRateRecordMutation();
    const [removeRating, removeState] = useRemoveRatingMutation();
    const [override, setOverride] = useState<Override | null>(null);

    // new server values supersede the local ones for good
    if (override !== null && !isSameRating(override.base, server)) {
        setOverride(null);
    }

    const current =
        override === null ? server : withVote(server, override.myRating);
    const isPending = rateState.isLoading || removeState.isLoading;

    const apply = async (next: number | null, request: () => Promise<null>) => {
        const previous = current.myRating;

        setOverride({ base: server, myRating: next });

        try {
            await request();
        } catch {
            setOverride({ base: server, myRating: previous });
        }
    };

    return {
        ...current,
        isDisabled: !isHydrated || isPending,
        rate: (value) =>
            apply(value, () => rateRecord({ target, id, value }).unwrap()),
        clear: () => apply(null, () => removeRating({ target, id }).unwrap()),
    };
};
