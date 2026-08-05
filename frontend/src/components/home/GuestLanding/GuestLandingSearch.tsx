import { Clock, Flame } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useGetRecipeTypesQuery } from "redux/services/recipeTypesApi";

import { SearchField } from "components/ui/SearchField";

import styles from "./GuestLandingSearch.module.scss";

const CHIP_ICON_SIZE = 14;

// the search box and category chips funnel the guest straight to the real list page rather than
// filtering in place - one source of truth for filtering (/all-recipes), no second state machine
export const GuestLandingSearch: React.FC = () => {
    const { t } = useTranslation("guestLanding");
    const navigate = useNavigate();
    const { data: types = [] } = useGetRecipeTypesQuery(null);
    const [searchValue, setSearchValue] = useState("");

    const handleSearchChange = (value: string) => {
        setSearchValue(value);

        if (value.trim() !== "") {
            void navigate(
                `${ROUTES.allRecipes}?q=${encodeURIComponent(value.trim())}`,
            );
        }
    };

    return (
        <div className={styles["guest-landing-search"]}>
            <SearchField
                value={searchValue}
                onChange={handleSearchChange}
                placeholder={t("searchPlaceholder")}
                className={styles["guest-landing-search__field"]}
            />
            <div className={styles["guest-landing-search__chips"]}>
                <Link
                    to={ROUTES.allRecipes}
                    className={[
                        styles["guest-landing-search__chip"],
                        styles["guest-landing-search__chip--active"],
                    ].join(" ")}
                >
                    {t("allChip")}
                </Link>
                {types.map((type) => (
                    <Link
                        key={type.id}
                        to={`${ROUTES.allRecipes}?types=${type.id}`}
                        className={styles["guest-landing-search__chip"]}
                    >
                        {type.type_name}
                    </Link>
                ))}
                <span className={styles["guest-landing-search__divider"]} />
                <Link
                    to={ROUTES.allRecipes}
                    className={styles["guest-landing-search__chip"]}
                >
                    <Clock size={CHIP_ICON_SIZE} aria-hidden="true" />
                    {t("cookingTimeChip")}
                </Link>
                <Link
                    to={ROUTES.allRecipes}
                    className={styles["guest-landing-search__chip"]}
                >
                    <Flame size={CHIP_ICON_SIZE} aria-hidden="true" />
                    {t("caloriesChip")}
                </Link>
            </div>
        </div>
    );
};
