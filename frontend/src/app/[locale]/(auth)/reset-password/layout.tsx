import { ROUTES } from "constants/routes";

import { authPageMetadata } from "utils/authPageMetadata";

export const generateMetadata = authPageMetadata({
    path: ROUTES.resetPassword,
    titleKey: "resetPasswordPage.heading",
    descriptionKey: "resetPasswordPage.taglineDescription",
});

export { AuthRouteLayout as default } from "app/[locale]/(auth)/AuthRouteLayout";
