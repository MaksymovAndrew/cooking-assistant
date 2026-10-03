import { act } from "@testing-library/react";

import { useFilterSearchParams } from "hooks/useFilterSearchParams";

import { setTestLocation } from "test/nextNavigationMock";
import { mockNavigate } from "test/router";
import { renderHookWithRouter } from "test/store";

const setup = (url = "/all-recipes?q=soup") =>
    renderHookWithRouter(() => useFilterSearchParams(), {
        initialEntries: [url],
    });

describe("useFilterSearchParams", () => {
    it("should read the filters from the address", () => {
        const { result } = setup();

        expect(result.current.currentParams.toString()).toBe("q=soup");
    });

    it("should navigate to the same page with the new filters", async () => {
        const { result } = setup();

        act(() => {
            result.current.setSearchParams(new URLSearchParams("q=stew"));
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockNavigate).toHaveBeenCalledWith("/all-recipes?q=stew");
    });

    it("should drop the question mark when every filter is cleared", async () => {
        const { result } = setup();

        act(() => {
            result.current.setSearchParams(new URLSearchParams(), {
                replace: true,
            });
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(mockNavigate).toHaveBeenCalledWith("/all-recipes");
    });

    it("should report the requested filters before the navigation lands", async () => {
        const { result } = setup();

        act(() => {
            result.current.setSearchParams(new URLSearchParams("types=2"));
        });

        expect(window.location.search).toBe("?q=soup");
        expect(result.current.currentParams.toString()).toBe("types=2");

        await act(async () => {
            await Promise.resolve();
        });
    });

    it("should follow the address once the navigation lands", async () => {
        const { result } = setup();

        act(() => {
            result.current.setSearchParams(new URLSearchParams("types=2"));
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(window.location.search).toBe("?types=2");
        expect(result.current.currentParams.toString()).toBe("types=2");
    });

    it("should give way to an address change made elsewhere", async () => {
        const { result } = setup();

        act(() => {
            result.current.setSearchParams(new URLSearchParams("types=2"));
        });
        act(() => {
            setTestLocation("/all-recipes?q=pie");
        });

        expect(result.current.currentParams.toString()).toBe("q=pie");

        await act(async () => {
            await Promise.resolve();
        });
    });
});
