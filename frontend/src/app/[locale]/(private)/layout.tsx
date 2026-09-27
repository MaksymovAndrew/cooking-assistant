import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PrivateRoute } from "components/layout/PrivateRoute";

// one rule for the whole private area rather than a line per page: nothing under here is
// meaningful to a crawler, and every page of it answers a guest with a redirect to login
export const metadata: Metadata = { robots: { index: false, follow: false } };

interface PrivateLayoutProps {
    children: ReactNode;
}

// the route group is the privacy boundary: a page under it cannot forget its own guard
const PrivateLayout = ({ children }: PrivateLayoutProps) => (
    <PrivateRoute>{children}</PrivateRoute>
);

export default PrivateLayout;
