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

// a push lands later, so the last requested value is the truth until the URL itself changes
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

            // a navigation the guard defers may be dropped, so only a started one is remembered
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
