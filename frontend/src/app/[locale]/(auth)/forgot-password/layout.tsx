import { ROUTES } from "constants/routes";

import { authPageMetadata } from "utils/authPageMetadata";

export const generateMetadata = authPageMetadata({
    path: ROUTES.forgotPassword,
    titleKey: "forgotPasswordPage.heading",
    descriptionKey: "forgotPasswordPage.taglineDescription",
});

export { AuthRouteLayout as default } from "app/[locale]/(auth)/AuthRouteLayout";
