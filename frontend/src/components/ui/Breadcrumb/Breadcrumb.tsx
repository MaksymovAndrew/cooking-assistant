import { ChevronRight } from "lucide-react";
import React from "react";

import { Link } from "components/ui/Link";

import { cx } from "utils/cx";

import styles from "./Breadcrumb.module.scss";

interface BreadcrumbProps {
    label: string;
    parentHref: string;
    parentLabel: string;
    current: string;
    // the detail pages have a mobile back header in its place
    desktopOnly?: boolean;
}

const SEPARATOR_ICON_SIZE = 14;

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
    label,
    parentHref,
    parentLabel,
    current,
    desktopOnly = false,
}) => (
    <nav
        aria-label={label}
        className={cx(
            styles.breadcrumb,
            desktopOnly && styles["breadcrumb--desktop-only"],
        )}
    >
        <Link href={parentHref} className={styles.breadcrumb__link}>
            {parentLabel}
        </Link>
        <ChevronRight size={SEPARATOR_ICON_SIZE} aria-hidden="true" />
        <span className={styles.breadcrumb__current}>{current}</span>
    </nav>
);
