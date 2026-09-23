"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { useAppRouter } from "hooks/useAppRouter";
import type { SetFilterValueOptions } from "hooks/useListFilters";

interface FilterSearchParams {
    currentParams: URLSearchParams;
    setSearchParams: (
        next: URLSearchParams,
        options?: SetFilterValueOptions,
    ) => void;
}

// a router push does not update useSearchParams() straight away, so a second write made
// before the first one lands would merge onto pre-write state - resetting the filters and
// immediately picking another one would silently keep both. Until some navigation lands,
// the value we last asked for is the truth; any change to the URL hands control back to it
export function useFilterSearchParams(): FilterSearchParams {
    const router = useAppRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [requested, setRequested] = useState<{
        params: string;
        writtenOver: string;
    } | null>(null);
    const actualParams = searchParams.toString();

    if (requested !== null && requested.writtenOver !== actualParams) {
        setRequested(null);
    }

    const pendingParams =
        requested?.writtenOver === actualParams ? requested.params : null;
    const currentParams = useMemo(
        () =>
            pendingParams === null
                ? searchParams
                : new URLSearchParams(pendingParams),
        [pendingParams, searchParams],
    );

    const setSearchParams = useCallback(
        (next: URLSearchParams, options?: SetFilterValueOptions) => {
            const query = next.toString();
            const href = query ? `${pathname}?${query}` : pathname;

            // only remember the write once the navigation is under way: a write the guard
            // defers may be dropped, and the filters must not claim to be applied then
            const navigated = options?.replace
                ? router.replace(href)
                : router.push(href);

            if (navigated) {
                setRequested({ params: query, writtenOver: actualParams });
            }
        },
        [actualParams, pathname, router],
    );

    return { currentParams, setSearchParams };
}
