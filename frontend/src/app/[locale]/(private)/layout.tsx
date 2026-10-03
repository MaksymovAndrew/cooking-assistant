import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PrivateRoute } from "components/layout/PrivateRoute";

// nothing here is meaningful to a crawler: every page answers a guest with a login redirect
export const metadata: Metadata = { robots: { index: false, follow: false } };

interface PrivateLayoutProps {
    children: ReactNode;
}

// the route group is the privacy boundary: a page under it cannot forget its own guard
const PrivateLayout = ({ children }: PrivateLayoutProps) => (
    <PrivateRoute>{children}</PrivateRoute>
);

export default PrivateLayout;
