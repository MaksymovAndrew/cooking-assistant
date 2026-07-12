import { ChevronLeft } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { EditMark } from "components/icons";
import { Logo } from "components/layout/Logo";

import styles from "./MobileSubpageHeader.module.scss";

interface MobileSubpageHeaderProps {
    backTo: string;
    // when set, shows the page's own title instead of the app wordmark, and an edit-pencil link on the right instead of an empty spacer
    title?: string;
    editTo?: string;
}

const BACK_ICON_SIZE = 22;
const EDIT_ICON_SIZE = 18;
const LOGO_SIZE = 20;

export const MobileSubpageHeader: React.FC<MobileSubpageHeaderProps> = ({
    backTo,
    title,
    editTo,
}) => {
    const { t } = useTranslation();

    return (
        <header className={styles["mobile-subpage-header"]}>
            <Link
                to={backTo}
                aria-label={t("mobileSubpageHeader.back")}
                className={styles["mobile-subpage-header__back"]}
            >
                <ChevronLeft size={BACK_ICON_SIZE} aria-hidden="true" />
            </Link>
            {title ? (
                <span className={styles["mobile-subpage-header__title"]}>
                    {title}
                </span>
            ) : (
                <div className={styles["mobile-subpage-header__wordmark"]}>
                    <Logo
                        to={ROUTES.home}
                        size={LOGO_SIZE}
                        variant="detailed"
                    />
                </div>
            )}
            {editTo ? (
                <Link
                    to={editTo}
                    aria-label={t("mobileSubpageHeader.edit")}
                    className={styles["mobile-subpage-header__edit"]}
                >
                    <EditMark size={EDIT_ICON_SIZE} />
                </Link>
            ) : (
                <span className={styles["mobile-subpage-header__spacer"]} />
            )}
        </header>
    );
};
