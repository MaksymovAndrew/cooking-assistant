import React from "react";
import { useTranslation } from "react-i18next";

import { usePageTitle } from "hooks/usePageTitle";

import { HomeDashboard } from "components/home/HomeDashboard";
import { AppShell } from "components/layout/AppShell";

const HomePage: React.FC = () => {
    const { t } = useTranslation("home");

    usePageTitle(t("pageTitle"));

    return (
        <AppShell>
            <HomeDashboard />
        </AppShell>
    );
};

export default HomePage;
