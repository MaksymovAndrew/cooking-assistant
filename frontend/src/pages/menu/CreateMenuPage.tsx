import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useCreateMenuPage } from "hooks/useCreateMenuPage";
import { usePageTitle } from "hooks/usePageTitle";

import { MenuForm } from "components/forms/MenuForm";
import { AppShell } from "components/layout/AppShell";

import styles from "./MenuFormPage.module.scss";

const CreateMenuPage: React.FC = () => {
    const { t } = useTranslation("menu");
    const { form, categories, allRecipes, handleSubmit } = useCreateMenuPage();

    usePageTitle(t("createMenuPage.heading"));

    return (
        <AppShell>
            <div className={styles["menu-form-page"]}>
                <nav
                    aria-label={t("createMenuPage.breadcrumb")}
                    className={styles["menu-form-page__breadcrumb"]}
                >
                    <Link to={ROUTES.allMenus}>
                        {t("createMenuPage.breadcrumbMenus")}
                    </Link>
                    <ChevronRight size={14} aria-hidden="true" />
                    <span>{t("createMenuPage.breadcrumbCurrent")}</span>
                </nav>
                <h1 className={styles["menu-form-page__heading"]}>
                    {t("createMenuPage.heading")}
                </h1>
                <MenuForm
                    form={form}
                    categories={categories}
                    allRecipes={allRecipes}
                    keyPrefix="createMenuPage"
                    idPrefix="create-menu"
                    submitLabel={t("createMenuPage.createButton")}
                    onSubmit={() => {
                        void handleSubmit();
                    }}
                />
            </div>
        </AppShell>
    );
};

export default CreateMenuPage;
