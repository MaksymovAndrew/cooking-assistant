import { act, renderHook } from "@testing-library/react";

import { useDisclosure } from "hooks/useDisclosure";

describe("useDisclosure", () => {
    it("should start closed by default", () => {
        const { result } = renderHook(() => useDisclosure());

        expect(result.current.isOpen).toBe(false);
    });

    it("should start open when given an initial value", () => {
        const { result } = renderHook(() => useDisclosure(true));

        expect(result.current.isOpen).toBe(true);
    });

    it("should open", () => {
        const { result } = renderHook(() => useDisclosure());

        act(() => {
            result.current.open();
        });

        expect(result.current.isOpen).toBe(true);
    });

    it("should close", () => {
        const { result } = renderHook(() => useDisclosure(true));

        act(() => {
            result.current.close();
        });

        expect(result.current.isOpen).toBe(false);
    });

    it("should toggle", () => {
        const { result } = renderHook(() => useDisclosure());

        act(() => {
            result.current.toggle();
        });
        expect(result.current.isOpen).toBe(true);

        act(() => {
            result.current.toggle();
        });
        expect(result.current.isOpen).toBe(false);
    });
});
