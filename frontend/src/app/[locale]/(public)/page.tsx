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

interface HomePageProps {
    params: Promise<{ locale: string }>;
}

// canonical is a per-route fact: the root layout deliberately sets none, so each route carries its own
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
        // reading the cookie is also how Next signals that this route must render dynamically -
        // swallowing that signal would break the route rather than degrade it
        unstable_rethrow(error);
        logger.error(error);

        return SESSION.unknown;
    }
};

// "/" is the one route whose content depends on the session, not just its chrome - deciding
// that here is what removes the flash of the wrong page a client-side check always had
const HomePage = async ({ params }: HomePageProps) => {
    const session = await loadSession(toLocale((await params).locale));

    // the API was unreachable: hand the decision back to the browser, the way this route made
    // it before it was server-rendered, rather than showing a signed-in visitor the landing
    // page until they think to reload
    if (session === SESSION.unknown) {
        return (
            <HomeRoute
                authedElement={<HomeDashboardView />}
                guestElement={<GuestLandingView />}
            />
        );
    }

    return session === SESSION.authed ? (
        <HomeDashboardView />
    ) : (
        <GuestLandingView />
    );
};

export default HomePage;
