import { renderHook } from "@testing-library/react";

import { useScrollLock } from "hooks/useScrollLock";

describe("useScrollLock", () => {
    it("should not change overflow when not locked", () => {
        document.body.style.overflow = "";

        renderHook(() => {
            useScrollLock(false);
        });

        expect(document.body.style.overflow).toBe("");
    });

    it("should hide overflow while locked", () => {
        document.body.style.overflow = "";

        renderHook(() => {
            useScrollLock(true);
        });

        expect(document.body.style.overflow).toBe("hidden");
    });

    it("should restore the previous overflow on unmount", () => {
        document.body.style.overflow = "scroll";

        const { unmount } = renderHook(() => {
            useScrollLock(true);
        });

        expect(document.body.style.overflow).toBe("hidden");

        unmount();

        expect(document.body.style.overflow).toBe("scroll");
    });

    it("should keep scroll locked while a second lock is still active", () => {
        document.body.style.overflow = "scroll";

        const { unmount: unmountFirst } = renderHook(() => {
            useScrollLock(true);
        });
        const { unmount: unmountSecond } = renderHook(() => {
            useScrollLock(true);
        });

        expect(document.body.style.overflow).toBe("hidden");

        unmountFirst();

        expect(document.body.style.overflow).toBe("hidden");

        unmountSecond();

        expect(document.body.style.overflow).toBe("scroll");
    });

    it("should pin body position to the current scroll offset while locked, and restore scroll position on unmount", () => {
        const scrollToSpy = jest.spyOn(window, "scrollTo").mockImplementation();

        Object.defineProperty(window, "scrollY", {
            configurable: true,
            value: 240,
        });

        const { unmount } = renderHook(() => {
            useScrollLock(true);
        });

        expect(document.body.style.position).toBe("fixed");
        expect(document.body.style.top).toBe("-240px");

        unmount();

        expect(document.body.style.position).toBe("");
        expect(document.body.style.top).toBe("");
        expect(scrollToSpy).toHaveBeenCalledWith(0, 240);

        scrollToSpy.mockRestore();
    });
});
