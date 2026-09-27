"use client";

import React from "react";

import { HomeDashboard } from "components/home/HomeDashboard";
import { AppShell } from "components/layout/AppShell";

export const HomeDashboardView: React.FC = () => (
    <AppShell>
        <HomeDashboard />
    </AppShell>
);
