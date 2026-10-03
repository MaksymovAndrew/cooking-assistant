"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

import { useLocale } from "hooks/useLocale";

import { useNavigationBlocker } from "components/layout/NavigationBlocker";

import { localizePath } from "utils/localePath";

// a string href only: every path comes from constants/routes and is localized here
export type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
    href: string;
};

// the app's only link: a bare next/link would skip the unsaved-changes guard without a trace
export const Link = ({ href, replace, onNavigate, ...rest }: LinkProps) => {
    const router = useRouter();
    const locale = useLocale();
    const localizedHref = localizePath(href, locale);
    const { hasUnsavedChanges, defer } = useNavigationBlocker();

    const handleNavigate = (event: { preventDefault: () => void }) => {
        if (hasUnsavedChanges()) {
            event.preventDefault();
            defer(() => {
                if (replace === true) {
                    router.replace(localizedHref);

                    return;
                }

                router.push(localizedHref);
            });

            return;
        }

        onNavigate?.(event);
    };

    return (
        <NextLink
            href={localizedHref}
            replace={replace}
            onNavigate={handleNavigate}
            {...rest}
        />
    );
};
