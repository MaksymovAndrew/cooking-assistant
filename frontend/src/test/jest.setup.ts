// fetch API polyfill (Request/Response): the data router builds a Request for every client-side navigation, and jsdom doesn't ship one
import "whatwg-fetch";
import "@testing-library/jest-dom";
// initializes the shared i18n instance so components using useTranslation() render real English strings in tests
import "i18n/index";

import { configure } from "@testing-library/react";

// widened so a slow-but-correct test never flakes on a busy machine under full-suite parallelism
const ASYNC_UTIL_TIMEOUT_MS = 2500;
// room for a few sequential async waits within one test before the test itself times out
const TEST_TIMEOUT_MS = ASYNC_UTIL_TIMEOUT_MS * 4;

configure({ asyncUtilTimeout: ASYNC_UTIL_TIMEOUT_MS });
jest.setTimeout(TEST_TIMEOUT_MS);

// keep tests isolated from each other's auth-token / pantry state
afterEach(() => {
    localStorage.clear();
});
