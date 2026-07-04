import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "constants/routes";

const NotFoundPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleGoHome = () => {
        void navigate(ROUTES.home);
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col sm:items-center md:items-start xl:items-start sm:space-y-1 md:space-y-4 xl:space-y-4">
                <h1 className="xl:text-6xl md:text-6xl sm:text-h3 font-kharkiv">
                    {t("notFound.title")}
                </h1>
                <h2 className="xl:text-2xl md:text-2xl font-montserratMedium">
                    {t("notFound.subtitle")}
                </h2>
                <p className="xl:text-lg sm:text-xs-pl md:text-lg max-w-xs font-montserratRegular">
                    {t("notFound.description")}
                </p>
                <button
                    onClick={handleGoHome}
                    className="bg-perfect-yellow px-6 py-2 rounded-full font-montserratMedium mt-4 hover:bg-yellow-600"
                >
                    {t("notFound.goHome")}
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;
