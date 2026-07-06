import React from "react";

import styles from "./SettingsSection.module.scss";

interface SettingsSectionProps {
    heading: string;
    children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
    heading,
    children,
}) => (
    <section className={styles["settings-section"]}>
        <h2 className={styles["settings-section__heading"]}>{heading}</h2>
        <div className={styles["settings-section__rows"]}>{children}</div>
    </section>
);
