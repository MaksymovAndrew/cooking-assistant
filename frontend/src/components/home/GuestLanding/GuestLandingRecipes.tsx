import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { MOBILE_MEDIA_QUERY } from "constants/breakpoints";
import { GUEST_LANDING_RECIPE_COUNT } from "constants/guestLanding";
import { ROUTES } from "constants/routes";
import type { RecipeSearchResultItem } from "types/recipe";

import { flattenPages } from "redux/services/infiniteQueryHelpers";
import { useGetRecipesByFiltersInfiniteQuery } from "redux/services/recipesApi";

import { useMediaQuery } from "hooks/useMediaQuery";

import { RecipeCard } from "components/cards/RecipeCard";
import { UtensilsMark } from "components/icons";
import { EmptyState } from "components/ui/EmptyState";
import { Link } from "components/ui/Link";
import { LinkButton } from "components/ui/LinkButton";

import styles from "./GuestLanding.module.scss";

const SEE_ALL_ICON_SIZE = 15;
const MOBILE_RECIPE_COUNT = 3;

interface GuestLandingRecipesProps {
    // null when the server could not load them
    recipes: RecipeSearchResultItem[] | null;
}

export const GuestLandingRecipes: React.FC<GuestLandingRecipesProps> = ({
    recipes: loaded,
}) => {
    const { t } = useTranslation("guestLanding");
    const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
    // the unfiltered /all-recipes request, trimmed here; skipped when the server sent the recipes
    const { data } = useGetRecipesByFiltersInfiniteQuery(
        {},
        { skip: loaded !== null },
    );
    const recipes = (loaded ?? flattenPages(data)).slice(
        0,
        isMobile ? MOBILE_RECIPE_COUNT : GUEST_LANDING_RECIPE_COUNT,
    );

    return (
        <section className={styles["guest-landing-section"]}>
            <div className={styles["guest-landing-section__header"]}>
                <h2 className={styles["guest-landing-section__title"]}>
                    {t("popularTitle")}
                </h2>
                <Link
                    href={ROUTES.allRecipes}
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
                        <LinkButton href={ROUTES.registration}>
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
