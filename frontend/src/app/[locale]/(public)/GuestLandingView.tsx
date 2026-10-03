"use client";

import React from "react";

import type { GuestLandingContent } from "types/guestLanding";

import { GuestLanding } from "components/home/GuestLanding";
import { AppShell } from "components/layout/AppShell";

interface GuestLandingViewProps {
    content: GuestLandingContent;
}

export const GuestLandingView: React.FC<GuestLandingViewProps> = ({
    content,
}) => (
    <AppShell>
        <GuestLanding content={content} />
    </AppShell>
);
