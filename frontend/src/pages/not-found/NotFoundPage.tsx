import { ArrowLeft } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { DonburiMarkDetailed } from "components/icons";
import { AppShell } from "components/layout/AppShell";
import { Button } from "components/ui/Button";

import styles from "./NotFoundPage.module.scss";

const BOWL_SIZE = 56;
const BACK_ICON_SIZE = 16;

const NotFoundPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <AppShell>
            <div className={styles["not-found"]}>
                <span className={styles["not-found__circle"]}>
                    <DonburiMarkDetailed size={BOWL_SIZE} />
                    <span
                        className={styles["not-found__badge"]}
                        aria-hidden="true"
                    >
                        ?
                    </span>
                </span>
                <p className={styles["not-found__numeral"]} aria-hidden="true">
                    404
                </p>
                <h1 className={styles["not-found__heading"]}>
                    {t("notFound.heading")}
                </h1>
                <p className={styles["not-found__description"]}>
                    {t("notFound.description")}
                </p>
                <Button
                    size="lg"
                    onClick={() => void navigate(ROUTES.allRecipes)}
                >
                    <ArrowLeft size={BACK_ICON_SIZE} aria-hidden="true" />
                    {t("notFound.backToRecipes")}
                </Button>
                <nav
                    className={styles["not-found__links"]}
                    aria-label={t("notFound.heading")}
                >
                    <Link to={ROUTES.allRecipes}>{t("notFound.recipes")}</Link>
                    <span aria-hidden="true">·</span>
                    <Link to={ROUTES.ingredients}>{t("notFound.pantry")}</Link>
                    <span aria-hidden="true">·</span>
                    <Link to={ROUTES.allMenus}>{t("notFound.menus")}</Link>
                </nav>
            </div>
        </AppShell>
    );
};

export default NotFoundPage;
