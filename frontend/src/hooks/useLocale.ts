"use client";

import { useTranslation } from "react-i18next";

import type { Locale } from "constants/locales";
import { toLocale } from "constants/locales";

// the page's language, read from the instance that renders it - on the server, that is this request's own
export const useLocale = (): Locale => toLocale(useTranslation().i18n.language);
