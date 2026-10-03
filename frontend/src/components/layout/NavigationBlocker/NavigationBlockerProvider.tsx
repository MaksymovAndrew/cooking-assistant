"use client";

import type { ReactNode, RefObject } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { clearGuardEntry, pushGuardEntry } from "./guardHistoryEntry";
import type { NavigationBlockerValue } from "./navigationBlockerContext";
import { NavigationBlockerContext } from "./navigationBlockerContext";
import { useBrowserExitGuards } from "./useBrowserExitGuards";

type DirtyRef = RefObject<boolean>;

interface NavigationBlockerProviderProps {
    children: ReactNode;
}

// Next has no navigation guard: Link, useAppRouter, beforeunload and a history entry each block an exit
export const NavigationBlockerProvider = ({
    children,
}: NavigationBlockerProviderProps) => {
    const dirtyRefs = useRef(new Set<DirtyRef>());
    const guardEntryPushed = useRef(false);
    const [pending, setPending] = useState<{ perform: () => void } | null>(
        null,
    );

    const hasUnsavedChanges = useCallback(
        () => [...dirtyRefs.current].some((ref) => ref.current),
        [],
    );

    // pushed only once dirty, so a pristine form's back button still works in one press
    const arm = useCallback((isArmed: boolean) => {
        if (isArmed === guardEntryPushed.current) {
            return;
        }

        guardEntryPushed.current = isArmed;

        if (isArmed) {
            pushGuardEntry();

            return;
        }

        clearGuardEntry();
    }, []);

    const register = useCallback((isDirtyRef: DirtyRef) => {
        dirtyRefs.current.add(isDirtyRef);

        return () => {
            dirtyRefs.current.delete(isDirtyRef);

            if (dirtyRefs.current.size === 0) {
                guardEntryPushed.current = false;
                clearGuardEntry();
            }
        };
    }, []);

    const defer = useCallback((perform: () => void) => {
        setPending({ perform });
    }, []);

    // the registry stays: a navigation that never happens would leave the form unguarded
    const proceed = useCallback(() => {
        const run = pending?.perform;

        setPending(null);
        run?.();
    }, [pending]);

    const reset = useCallback(() => {
        setPending(null);
    }, []);

    useBrowserExitGuards(hasUnsavedChanges, guardEntryPushed, defer);

    const value = useMemo<NavigationBlockerValue>(
        () => ({
            register,
            arm,
            hasUnsavedChanges,
            defer,
            isBlocked: pending !== null,
            proceed,
            reset,
        }),
        [register, arm, hasUnsavedChanges, defer, pending, proceed, reset],
    );

    return (
        <NavigationBlockerContext value={value}>
            {children}
        </NavigationBlockerContext>
    );
};
