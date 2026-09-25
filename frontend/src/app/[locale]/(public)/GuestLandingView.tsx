"use client";

import React from "react";

import { GuestLanding } from "components/home/GuestLanding";
import { AppShell } from "components/layout/AppShell";

export const GuestLandingView: React.FC = () => (
    <AppShell>
        <GuestLanding />
    </AppShell>
);
