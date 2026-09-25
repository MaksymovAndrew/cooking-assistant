"use client";

import { useEffect } from "react";

import { logger } from "config/logger";

import { RouteErrorBoundary } from "components/layout/RouteErrorBoundary";

interface ErrorProps {
    error: Error;
    reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorProps) => {
    useEffect(() => {
        logger.error(error);
    }, [error]);

    return <RouteErrorBoundary onRetry={reset} />;
};

export default ErrorPage;
