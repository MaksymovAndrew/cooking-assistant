import React from "react";
import { useTranslation } from "react-i18next";

import { usePageTitle } from "hooks/usePageTitle";

import { GuestLanding } from "components/home/GuestLanding";
import { AppShell } from "components/layout/AppShell";

const GuestLandingPage: React.FC = () => {
    const { t } = useTranslation("guestLanding");

    usePageTitle(t("heading"));

    return (
        <AppShell>
            <GuestLanding />
        </AppShell>
    );
};

export default GuestLandingPage;
