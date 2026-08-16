import { Plus } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useGetMeQuery } from "redux/services/authApi";

import { LinkButton } from "components/ui/LinkButton";

import { formatDashboardDate } from "utils/formatDashboardDate";

import styles from "./GreetingHeader.module.scss";

const ICON_SIZE = 16;

export const GreetingHeader: React.FC = () => {
    const { t } = useTranslation("home");
    const { data: currentUser } = useGetMeQuery(null);

    return (
        <div className={styles["greeting-header"]}>
            <div className={styles["greeting-header__text"]}>
                <div className={styles["greeting-header__date"]}>
                    {formatDashboardDate(new Date())}
                </div>
                <h1 className={styles["greeting-header__title"]}>
                    {currentUser?.name
                        ? t("greeting.welcomeWithName", {
                              name: currentUser.name,
                          })
                        : t("greeting.welcome")}
                </h1>
            </div>
            <div className={styles["greeting-header__actions"]}>
                <LinkButton to={ROUTES.addMenu} variant="secondary">
                    <Plus size={ICON_SIZE} aria-hidden="true" />
                    {t("actions.newMenu")}
                </LinkButton>
                <LinkButton to={ROUTES.addRecipe}>
                    <Plus size={ICON_SIZE} aria-hidden="true" />
                    {t("actions.newRecipe")}
                </LinkButton>
            </div>
        </div>
    );
};
