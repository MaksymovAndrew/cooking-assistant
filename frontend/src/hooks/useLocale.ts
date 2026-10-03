import { useTranslation } from "react-i18next";

import type { Locale } from "constants/locales";
import { toLocale } from "constants/locales";

// read from the rendering instance, which on the server is this request's own
export const useLocale = (): Locale => toLocale(useTranslation().i18n.language);
