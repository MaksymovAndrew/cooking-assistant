import React from "react";

import styles from "./GuestLanding.module.scss";
import { GuestLandingDiscover } from "./GuestLandingDiscover";
import { GuestLandingHero } from "./GuestLandingHero";

export const GuestLanding: React.FC = () => (
    <div className={styles["guest-landing"]}>
        <GuestLandingHero />
        <GuestLandingDiscover />
    </div>
);
