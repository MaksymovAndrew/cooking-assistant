"use client";

import type { ReactNode } from "react";
import React from "react";

import { useSessionGate } from "hooks/useSessionGate";

import { BlankScreen } from "components/layout/BlankScreen";
import { SessionErrorState } from "components/layout/SessionErrorState";

interface HomeRouteProps {
    authedElement: ReactNode;
    guestElement: ReactNode;
}

export const HomeRoute: React.FC<HomeRouteProps> = ({
    authedElement,
    guestElement,
}) => {
    const { isChecking, isAuthed, isGuest } = useSessionGate();

    if (isChecking) return <BlankScreen />;
    if (isAuthed) return <>{authedElement}</>;
    if (isGuest) return <>{guestElement}</>;

    return <SessionErrorState />;
};
