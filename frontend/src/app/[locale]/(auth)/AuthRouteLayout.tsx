import type { ReactNode } from "react";

interface AuthRouteLayoutProps {
    children: ReactNode;
}

// a sign-in route has a layout only to carry the metadata its client page cannot export
export const AuthRouteLayout = ({ children }: AuthRouteLayoutProps) => children;
