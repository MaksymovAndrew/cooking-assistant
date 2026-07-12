import React from "react";

import { HomeDashboard } from "components/home/HomeDashboard";
import { AppShell } from "components/layout/AppShell";

const HomePage: React.FC = () => (
    <AppShell>
        <HomeDashboard />
    </AppShell>
);

export default HomePage;
