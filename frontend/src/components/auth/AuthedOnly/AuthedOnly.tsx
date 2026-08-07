import type { ReactNode } from "react";
import React from "react";

import { useAppSelector } from "redux/hooks";
import { selectIsAuthed } from "redux/selectors/sessionSelectors";

interface AuthedOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}

// keeps auth-branching out of leaf components: render logged-in-only UI without an isAuthed
// check at every call site
export const AuthedOnly: React.FC<AuthedOnlyProps> = ({
    children,
    fallback = null,
}) => {
    const isAuthed = useAppSelector(selectIsAuthed);

    return <>{isAuthed ? children : fallback}</>;
};
