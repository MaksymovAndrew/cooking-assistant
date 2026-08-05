import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { MOBILE_MEDIA_QUERY } from "constants/breakpoints";
import { ROUTES } from "constants/routes";

import { flattenPages } from "redux/services/infiniteQueryHelpers";
import { useGetRecipesByFiltersInfiniteQuery } from "redux/services/recipesApi";

import { useMediaQuery } from "hooks/useMediaQuery";

import { RecipeCard } from "components/cards/RecipeCard";
import { UtensilsMark } from "components/icons";
import { EmptyState } from "components/ui/EmptyState";
import { LinkButton } from "components/ui/LinkButton";

import styles from "./GuestLanding.module.scss";

const SEE_ALL_ICON_SIZE = 15;
const DESKTOP_RECIPE_COUNT = 4;
const MOBILE_RECIPE_COUNT = 3;

export const GuestLandingRecipes: React.FC = () => {
    const { t } = useTranslation("guestLanding");
    const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
    // same request /all-recipes fires with no filters applied, so it's already cached once a
    // guest clicks through - the count is trimmed client-side, not by a second endpoint
    const { data } = useGetRecipesByFiltersInfiniteQuery({});
    const recipes = flattenPages(data).slice(
        0,
        isMobile ? MOBILE_RECIPE_COUNT : DESKTOP_RECIPE_COUNT,
    );

    return (
        <section className={styles["guest-landing-section"]}>
            <div className={styles["guest-landing-section__header"]}>
                <h2 className={styles["guest-landing-section__title"]}>
                    {t("popularTitle")}
                </h2>
                <Link
                    to={ROUTES.allRecipes}
                    className={styles["guest-landing-section__see-all"]}
                >
                    {t("seeAllRecipes")}
                    <ChevronRight size={SEE_ALL_ICON_SIZE} aria-hidden="true" />
                </Link>
            </div>
            {recipes.length === 0 ? (
                <EmptyState
                    icon={UtensilsMark}
                    title={t("emptyRecipesTitle")}
                    description={t("emptyRecipesDescription")}
                    action={
                        <LinkButton to={ROUTES.registration}>
                            {t("common:nav.register")}
                        </LinkButton>
                    }
                />
            ) : (
                <div className={styles["guest-landing-section__recipe-grid"]}>
                    {recipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            variant={isMobile ? "row" : "grid"}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
