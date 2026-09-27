import { act } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { useSwitchLocale } from "hooks/useSwitchLocale";

import { readLocaleCookie } from "utils/localeCookie";
import { loadPage } from "utils/reloadPage";

import { mockedPut } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");
jest.mock("utils/reloadPage");

const setup = (status: "authed" | "guest") =>
    renderHookWithStore(
        () => useSwitchLocale(),
        makeTestStore({ session: { status } }),
    );

describe("useSwitchLocale", () => {
    beforeEach(() => {
        window.history.pushState({}, "", "/all-recipes?q=soup");
        mockedPut.mockResolvedValue({ data: null });
    });

    afterEach(() => {
        document.cookie = "NEXT_LOCALE=; Path=/; Max-Age=0";
        window.history.pushState({}, "", "/");
    });

    it("should load the same page in the chosen language", async () => {
        const { result } = setup("guest");

        await act(() => result.current("uk"));

        expect(jest.mocked(loadPage)).toHaveBeenCalledWith(
            "/uk/all-recipes?q=soup",
        );
    });

    it("should remember the choice on the device", async () => {
        const { result } = setup("guest");

        await act(() => result.current("pl"));

        expect(readLocaleCookie()).toBe("pl");
    });

    it("should not save the language to an account a guest doesn't have", async () => {
        const { result } = setup("guest");

        await act(() => result.current("ru"));

        expect(mockedPut).not.toHaveBeenCalled();
    });

    it("should save the language to the signed-in account", async () => {
        const { result } = setup("authed");

        await act(() => result.current("ru"));

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.auth.locale, {
            locale: "ru",
        });
    });

    it("should do nothing when the language is already shown", async () => {
        const { result } = setup("authed");

        await act(() => result.current("en"));

        expect(jest.mocked(loadPage)).not.toHaveBeenCalled();
        expect(mockedPut).not.toHaveBeenCalled();
    });
});
