import { act } from "@testing-library/react";

import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { useFinishLogin } from "hooks/useFinishLogin";

import { readLocaleCookie, writeLocaleCookie } from "utils/localeCookie";
import { loadPage } from "utils/reloadPage";

import { mockedPut, mockGetByUrl } from "test/apiClientMock";
import { ROUTE_HOME, ROUTE_LOGIN } from "test/constants";
import { mockNavigate } from "test/router";
import { renderHookWithRouter } from "test/store";

jest.mock("api/client");
jest.mock("utils/reloadPage");

const USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
    avatar_photo_key: null,
    calorie_goal: null,
    locale: "uk",
};

const finish = async (user: CurrentUser) => {
    mockGetByUrl({ [API_ROUTES.auth.me]: user });
    mockedPut.mockResolvedValue({ data: null });

    const { result } = renderHookWithRouter(() => useFinishLogin(), {
        initialEntries: [ROUTE_LOGIN],
    });

    await act(() => result.current());
};

describe("useFinishLogin", () => {
    afterEach(() => {
        document.cookie = "NEXT_LOCALE=; Path=/; Max-Age=0";
    });

    it("should open the app in the account's language when this device has no choice", async () => {
        await finish(USER);

        expect(jest.mocked(loadPage)).toHaveBeenCalledWith("/uk");
        expect(readLocaleCookie()).toBe("uk");
    });

    it("should stay in the current language when the account already uses it", async () => {
        await finish({ ...USER, locale: "en" });

        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_HOME);
        expect(jest.mocked(loadPage)).not.toHaveBeenCalled();
    });

    it("should save this device's choice to the account and keep the page", async () => {
        writeLocaleCookie("pl");

        await finish(USER);

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.auth.locale, {
            locale: "pl",
        });
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_HOME);
        expect(jest.mocked(loadPage)).not.toHaveBeenCalled();
    });

    it("should carry the page the user was heading to into the account's language", async () => {
        sessionStorage.setItem("login-redirect", "/menu/9");

        await finish({ ...USER, locale: "ru" });

        expect(jest.mocked(loadPage)).toHaveBeenCalledWith("/ru/menu/9");
    });
});
