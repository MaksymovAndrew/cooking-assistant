import type { LucideIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { EmptyState } from "components/ui/EmptyState";

interface ProfileComingSoonProps {
    icon: LucideIcon;
    title: string;
}

export const ProfileComingSoon: React.FC<ProfileComingSoonProps> = ({
    icon,
    title,
}) => {
    const { t } = useTranslation("profile");

    return (
        <EmptyState
            icon={icon}
            title={title}
            description={t("profilePage.comingSoonDescription")}
        />
    );
};
