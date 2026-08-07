import React from "react";

import styles from "./GuestLandingDiscover.module.scss";
import { GuestLandingMenuFilters } from "./GuestLandingMenuFilters";
import { GuestLandingMenus } from "./GuestLandingMenus";
import { GuestLandingRecipeFilters } from "./GuestLandingRecipeFilters";
import { GuestLandingRecipes } from "./GuestLandingRecipes";

// shared grid rows keep both columns' headings aligned, since the filters row's height varies
export const GuestLandingDiscover: React.FC = () => (
    <div className={styles["guest-landing-discover"]}>
        <div className={styles["guest-landing-discover__recipe-filters"]}>
            <GuestLandingRecipeFilters />
        </div>
        <div className={styles["guest-landing-discover__recipe-content"]}>
            <GuestLandingRecipes />
        </div>
        <div
            className={styles["guest-landing-discover__divider"]}
            aria-hidden="true"
        />
        <div className={styles["guest-landing-discover__menu-filters"]}>
            <GuestLandingMenuFilters />
        </div>
        <div className={styles["guest-landing-discover__menu-content"]}>
            <GuestLandingMenus />
        </div>
    </div>
);
