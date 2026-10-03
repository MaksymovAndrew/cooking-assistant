import React from "react";

import type { GuestLandingContent } from "types/guestLanding";

import styles from "./GuestLanding.module.scss";
import { GuestLandingDiscover } from "./GuestLandingDiscover";
import { GuestLandingHero } from "./GuestLandingHero";

interface GuestLandingProps {
    content: GuestLandingContent;
}

export const GuestLanding: React.FC<GuestLandingProps> = ({ content }) => (
    <div className={styles["guest-landing"]}>
        <GuestLandingHero />
        <GuestLandingDiscover content={content} />
    </div>
);
