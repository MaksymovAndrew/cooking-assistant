"use client";

import type { ReactNode } from "react";
import React, { useEffect, useRef } from "react";

import { ROUTES } from "constants/routes";

import { useAppRouter } from "hooks/useAppRouter";
import { useSessionGate } from "hooks/useSessionGate";

import { BlankScreen } from "components/layout/BlankScreen";
import { SessionErrorState } from "components/layout/SessionErrorState";

import { rememberLoginRedirect } from "utils/loginRedirect";

interface PrivateRouteProps {
    children: ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const router = useAppRouter();
    const redirectedRef = useRef(false);
    const { isChecking, isAuthed, isGuest } = useSessionGate();

    useEffect(() => {
        if (!isGuest || redirectedRef.current) {
            return;
        }

        redirectedRef.current = true;
        rememberLoginRedirect();
        router.replace(ROUTES.login);
    }, [isGuest, router]);

    if (isChecking || isGuest) return <BlankScreen />;
    if (isAuthed) return <>{children}</>;

    return <SessionErrorState />;
};
