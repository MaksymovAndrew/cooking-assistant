import { ROUTES } from "constants/routes";

import { authPageMetadata } from "utils/authPageMetadata";

export const generateMetadata = authPageMetadata({
    path: ROUTES.verifyEmail,
    titleKey: "verifyEmailPage.tagline",
    descriptionKey: "verifyEmailPage.taglineDescription",
});

export { AuthRouteLayout as default } from "app/[locale]/(auth)/AuthRouteLayout";
