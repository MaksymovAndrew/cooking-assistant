import { ChevronLeft } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { EditMark } from "components/icons";
import { Logo } from "components/layout/Logo";
import { Link } from "components/ui/Link";

import styles from "./MobileSubpageHeader.module.scss";

interface MobileSubpageHeaderProps {
    backTo: string;
    editTo?: string;
}

const BACK_ICON_SIZE = 22;
const EDIT_ICON_SIZE = 18;
const LOGO_SIZE = 20;

export const MobileSubpageHeader: React.FC<MobileSubpageHeaderProps> = ({
    backTo,
    editTo,
}) => {
    const { t } = useTranslation();

    return (
        <header className={styles["mobile-subpage-header"]}>
            <Link
                href={backTo}
                aria-label={t("mobileSubpageHeader.back")}
                className={styles["mobile-subpage-header__back"]}
            >
                <ChevronLeft size={BACK_ICON_SIZE} aria-hidden="true" />
            </Link>
            <div className={styles["mobile-subpage-header__wordmark"]}>
                <Logo href={ROUTES.home} size={LOGO_SIZE} />
            </div>
            {editTo ? (
                <Link
                    href={editTo}
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
