import type { ReactNode } from "react";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useSessionGate } from "hooks/useSessionGate";

import { SessionErrorState } from "components/layout/SessionErrorState";

import type { LoginRedirectState } from "utils/loginRedirect";

interface PrivateRouteProps {
    children?: ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const location = useLocation();
    const { isChecking, isAuthed, isGuest } = useSessionGate();

    if (isChecking) return <div className="min-h-screen" />;
    if (isAuthed) return <>{children ?? <Outlet />}</>;

    if (isGuest) {
        // carries where the guest was trying to go, so a successful login returns them there
        // instead of dropping them on the home dashboard - see utils/loginRedirect
        const state: LoginRedirectState = { from: location };

        return <Navigate to={ROUTES.login} state={state} replace />;
    }

    return <SessionErrorState />;
};
