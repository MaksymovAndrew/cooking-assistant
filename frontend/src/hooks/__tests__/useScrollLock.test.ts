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
});
