import type { ReactNode } from "react";
import React from "react";

import { useSessionGate } from "hooks/useSessionGate";

import { SessionErrorState } from "components/layout/SessionErrorState";

interface HomeRouteProps {
    authedElement: ReactNode;
    guestElement: ReactNode;
}

// "/" is the one route whose content itself depends on auth status, not just its chrome -
// PrivateRoute's redirect-to-login doesn't apply here since a guest is allowed on "/", they
// just see the marketing landing instead of the dashboard
export const HomeRoute: React.FC<HomeRouteProps> = ({
    authedElement,
    guestElement,
}) => {
    const { isChecking, isAuthed, isGuest } = useSessionGate();

    if (isChecking) return <div className="min-h-screen" />;
    if (isAuthed) return <>{authedElement}</>;
    if (isGuest) return <>{guestElement}</>;

    return <SessionErrorState />;
};
