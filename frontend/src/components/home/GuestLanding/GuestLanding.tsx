import React from "react";

import styles from "./GuestLanding.module.scss";
import { GuestLandingHero } from "./GuestLandingHero";
import { GuestLandingMenus } from "./GuestLandingMenus";
import { GuestLandingRecipes } from "./GuestLandingRecipes";
import { GuestLandingSearch } from "./GuestLandingSearch";

export const GuestLanding: React.FC = () => (
    <div className={styles["guest-landing"]}>
        <GuestLandingHero />
        <GuestLandingSearch />
        <GuestLandingRecipes />
        <GuestLandingMenus />
    </div>
);
