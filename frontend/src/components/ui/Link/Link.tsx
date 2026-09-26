"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

import { useLocale } from "hooks/useLocale";

import { useNavigationBlocker } from "components/layout/NavigationBlocker";

import { localizePath } from "utils/localePath";

// href is narrowed to a string: every destination in this app comes from constants/routes, and is
// shown in the page's own language
export type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
    href: string;
};

// the only link component in the app: a bare next/link would navigate straight past the
// unsaved-changes guard, and nothing at the call site would show that it does
export const Link = ({ href, replace, onNavigate, ...rest }: LinkProps) => {
    const router = useRouter();
    const locale = useLocale();
    const localizedHref = localizePath(href, locale);
    const { hasUnsavedChanges, defer } = useNavigationBlocker();

    const handleNavigate = (event: { preventDefault: () => void }) => {
        if (hasUnsavedChanges()) {
            event.preventDefault();
            // the deferred navigation has to be the one the link asked for, replace included
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
