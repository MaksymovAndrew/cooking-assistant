import { ROUTES } from "constants/routes";

import { authPageMetadata } from "utils/authPageMetadata";

export const generateMetadata = authPageMetadata({
    path: ROUTES.registration,
    titleKey: "registerPage.heading",
    descriptionKey: "registerPage.taglineDescription",
});

export { AuthRouteLayout as default } from "app/[locale]/(auth)/AuthRouteLayout";
