// fetch API polyfill (Request/Response): jsdom ships neither, and RTK Query reads them
import "whatwg-fetch";
import "@testing-library/jest-dom";

import { configure } from "@testing-library/react";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import { logger } from "config/logger";
import { DEFAULT_LOCALE } from "constants/locales";

import { ensureCatalogLoaded } from "i18n/loadCatalog";
import { i18nOptions } from "i18n/options";
import { RESOURCES } from "i18n/resources";

import { resetTestNavigation } from "test/nextNavigationMock";

// widened so a slow-but-correct test never flakes on a busy machine under full-suite parallelism
const ASYNC_UTIL_TIMEOUT_MS = 2500;
// room for a few sequential async waits within one test before the test itself times out
const TEST_TIMEOUT_MS = ASYNC_UTIL_TIMEOUT_MS * 4;

configure({ asyncUtilTimeout: ASYNC_UTIL_TIMEOUT_MS });

// the app hands its instance down through a provider; tests render components on their own, so the
// global instance stands in for it and useTranslation() renders real English strings
i18next
    .use(initReactI18next)
    .init(i18nOptions(DEFAULT_LOCALE, RESOURCES[DEFAULT_LOCALE]))
    .catch(logger.error);
jest.setTimeout(TEST_TIMEOUT_MS);

// production loads the catalog namespace lazily; tests need it available up front like before
beforeAll(() => ensureCatalogLoaded(i18next));

// keep tests isolated from each other's auth-token / pantry state
afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetTestNavigation();
});
