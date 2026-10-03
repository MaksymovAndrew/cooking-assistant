"use client";

import "styles/global.scss";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { logger } from "config/logger";

import { localeOfPath } from "utils/localePath";

import { GlobalErrorContent } from "app/GlobalErrorContent";

interface GlobalErrorProps {
    error: Error;
    retry: () => void;
}

// replaces the root layout when that itself fails, so it brings its own document and no providers
const GlobalError = ({ error, retry }: GlobalErrorProps) => {
    const locale = localeOfPath(usePathname());

    useEffect(() => {
        logger.error(error);
    }, [error]);

    return (
        <html lang={locale}>
            <body>
                <GlobalErrorContent locale={locale} onRetry={retry} />
            </body>
        </html>
    );
};

export default GlobalError;
