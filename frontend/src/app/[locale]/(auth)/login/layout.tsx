import { ROUTES } from "constants/routes";

import { authPageMetadata } from "utils/authPageMetadata";

export const generateMetadata = authPageMetadata({
    path: ROUTES.login,
    titleKey: "loginPage.heading",
    descriptionKey: "loginPage.taglineDescription",
});

export { AuthRouteLayout as default } from "app/[locale]/(auth)/AuthRouteLayout";
