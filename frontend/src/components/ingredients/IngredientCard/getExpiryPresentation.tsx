import type { TFunction } from "i18next";
import { AlertTriangle, Check, Clock } from "lucide-react";
import React from "react";

import type { ExpiryStatus } from "types/expiry";

import type { ChipVariant } from "components/ui/Chip";

import styles from "./IngredientCard.module.scss";

interface ExpiryPresentation {
    label: string;
    variant: ChipVariant;
    icon: React.ReactNode;
    borderModifier: string | false;
}

const BADGE_ICON_SIZE = 11;

export const getExpiryPresentation = (
    status: ExpiryStatus | null,
    t: TFunction,
): ExpiryPresentation => {
    if (status === null) {
        return {
            label: t("expiryBadge.noExpiry"),
            variant: "outline",
            icon: undefined,
            borderModifier: false,
        };
    }

    if (status.tone === "expired") {
        return {
            label: t("expiryBadge.expired"),
            variant: "danger",
            icon: <AlertTriangle size={BADGE_ICON_SIZE} />,
            borderModifier: styles["ingredient-card--expired"],
        };
    }

    if (status.tone === "warning") {
        return {
            label: t("expiryBadge.daysLeft", { count: status.days }),
            variant: "warning",
            icon: <Clock size={BADGE_ICON_SIZE} />,
            borderModifier: styles["ingredient-card--warning"],
        };
    }

    return {
        label: t("expiryBadge.fresh"),
        variant: "success",
        icon: <Check size={BADGE_ICON_SIZE} />,
        borderModifier: false,
    };
};
