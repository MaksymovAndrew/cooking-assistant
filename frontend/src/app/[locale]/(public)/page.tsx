import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";

import { logger } from "config/logger";
import type { Locale } from "constants/locales";
import { toLocale } from "constants/locales";
import { ROUTES } from "constants/routes";
import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";
import { fetchAsVisitor } from "api/server";

import { HomeRoute } from "components/layout/HomeRoute";

import { pageAlternates } from "utils/pageAlternates";

import { GuestLandingView } from "./GuestLandingView";
import { HomeDashboardView } from "./HomeDashboardView";
import { CLIENT_LOADED_LANDING, loadGuestLanding } from "./loadGuestLanding";

interface HomePageProps {
    params: Promise<{ locale: string }>;
}

// the root layout sets no canonical on purpose, so each route carries its own
export const generateMetadata = async ({
    params,
}: HomePageProps): Promise<Metadata> => ({
    alternates: pageAlternates(ROUTES.home, toLocale((await params).locale)),
});

const SESSION = {
    authed: "authed",
    guest: "guest",
    unknown: "unknown",
} as const;

type Session = (typeof SESSION)[keyof typeof SESSION];

// "unknown" is not "guest": an API that did not answer says nothing about who is asking
const loadSession = async (locale: Locale): Promise<Session> => {
    try {
        const currentUser = await fetchAsVisitor<CurrentUser>(
            API_ROUTES.auth.me,
            locale,
        );

        return currentUser ? SESSION.authed : SESSION.guest;
    } catch (error) {
        // reading the cookie throws Next's dynamic-rendering signal; swallowing it breaks the route
        unstable_rethrow(error);
        logger.error(error);

        return SESSION.unknown;
    }
};

// the one route whose content depends on the session; deciding it here avoids a wrong-page flash
const HomePage = async ({ params }: HomePageProps) => {
    const locale = toLocale((await params).locale);
    const session = await loadSession(locale);

    // API unreachable: let the browser decide rather than show a signed-in visitor the landing
    if (session === SESSION.unknown) {
        return (
            <HomeRoute
                authedElement={<HomeDashboardView />}
                guestElement={
                    <GuestLandingView content={CLIENT_LOADED_LANDING} />
                }
            />
        );
    }

    return session === SESSION.authed ? (
        <HomeDashboardView />
    ) : (
        <GuestLandingView content={await loadGuestLanding(locale)} />
    );
};

export default HomePage;
