import React from "react";

import styles from "./BlankScreen.module.scss";

// holds the layout while the session is undecided; a spinner would flash on every navigation
export const BlankScreen: React.FC = () => (
    <div className={styles["blank-screen"]} />
);
