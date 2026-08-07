import { Clock, Flame, Search } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useGetRecipeTypesQuery } from "redux/services/recipeTypesApi";

import { LinkButton } from "components/ui/LinkButton";

import { RECIPE_TYPE_URL_PARAM } from "utils/filters/recipeFilterDefs";

import styles from "./GuestLandingFilters.module.scss";

const SEARCH_ICON_SIZE = 18;
const CHIP_ICON_SIZE = 14;

// each chip links straight to /all-recipes with the filter already in the URL - one source of
// truth for filtering, no second state machine duplicating RecipeFilterPanel here
export const GuestLandingRecipeFilters: React.FC = () => {
    const { t } = useTranslation("guestLanding");
    const { data: types = [] } = useGetRecipeTypesQuery(null);

    return (
        <div className={styles["guest-landing-filters"]}>
            <LinkButton
                to={ROUTES.allRecipes}
                variant="secondary"
                className={styles["guest-landing-filters__search-button"]}
            >
                <Search size={SEARCH_ICON_SIZE} aria-hidden="true" />
                {t("searchRecipesButton")}
            </LinkButton>
            <div className={styles["guest-landing-filters__chips"]}>
                <Link
                    to={ROUTES.allRecipes}
                    className={[
                        styles["guest-landing-filters__chip"],
                        styles["guest-landing-filters__chip--active"],
                    ].join(" ")}
                >
                    {t("allChip")}
                </Link>
                {types.map((type) => (
                    <Link
                        key={type.id}
                        to={`${ROUTES.allRecipes}?${RECIPE_TYPE_URL_PARAM}=${type.id}`}
                        className={styles["guest-landing-filters__chip"]}
                    >
                        {type.type_name}
                    </Link>
                ))}
                <Link
                    to={ROUTES.allRecipes}
                    className={styles["guest-landing-filters__chip"]}
                >
                    <Clock size={CHIP_ICON_SIZE} aria-hidden="true" />
                    {t("cookingTimeChip")}
                </Link>
                <Link
                    to={ROUTES.allRecipes}
                    className={styles["guest-landing-filters__chip"]}
                >
                    <Flame size={CHIP_ICON_SIZE} aria-hidden="true" />
                    {t("caloriesChip")}
                </Link>
            </div>
        </div>
    );
};
