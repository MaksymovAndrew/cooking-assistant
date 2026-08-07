import { renderHook } from "@testing-library/react";

import { usePageTitle } from "hooks/usePageTitle";

describe("usePageTitle", () => {
    it("should set the document title to the page title plus the app name", () => {
        renderHook(() => {
            usePageTitle("Recipes");
        });

        expect(document.title).toBe("Recipes - Cooking Assistant");
    });

    it("should fall back to just the app name when no title is given", () => {
        renderHook(() => {
            usePageTitle(undefined);
        });

        expect(document.title).toBe("Cooking Assistant");
    });

    it("should update the title when it changes", () => {
        const { rerender } = renderHook(
            ({ title }: { title: string }) => {
                usePageTitle(title);
            },
            { initialProps: { title: "Recipes" } },
        );

        rerender({ title: "Menus" });

        expect(document.title).toBe("Menus - Cooking Assistant");
    });
});
