import type { AnchorHTMLAttributes, MouseEvent } from "react";
import React from "react";

import { useRouter } from "./nextNavigationMock";

interface NextLinkMockProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    onNavigate?: (event: { preventDefault: () => void }) => void;
}

// keeps next/link's onNavigate contract, so the unsaved-changes guard in ui/Link runs for real
const NextLinkMock = ({
    href,
    onNavigate,
    onClick,
    children,
    ...rest
}: NextLinkMockProps) => {
    const router = useRouter();

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        event.preventDefault();

        const navigation = { prevented: false };

        onNavigate?.({
            preventDefault: () => {
                navigation.prevented = true;
            },
        });

        if (!navigation.prevented) {
            router.push(href);
        }
    };

    return (
        <a href={href} onClick={handleClick} {...rest}>
            {children}
        </a>
    );
};

export default NextLinkMock;
