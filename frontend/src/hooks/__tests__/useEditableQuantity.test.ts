import { act, renderHook } from "@testing-library/react";

import { useEditableQuantity } from "hooks/useEditableQuantity";

describe("useEditableQuantity", () => {
    it("should start with the given value as text", () => {
        const { result } = renderHook(() => useEditableQuantity(1, jest.fn()));

        expect(result.current.text).toBe("1");
    });

    it("should let the field go empty while typing without reverting", () => {
        const onCommit = jest.fn();
        const { result } = renderHook(() => useEditableQuantity(1, onCommit));

        act(() => {
            result.current.onChange({
                target: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>);
        });

        expect(result.current.text).toBe("");
        expect(onCommit).not.toHaveBeenCalled();
    });

    it("should commit a valid value as the user types it", () => {
        const onCommit = jest.fn();
        const { result } = renderHook(() => useEditableQuantity(1, onCommit));

        act(() => {
            result.current.onChange({
                target: { value: "8" },
            } as React.ChangeEvent<HTMLInputElement>);
        });

        expect(onCommit).toHaveBeenCalledWith(8);
    });

    it("should revert to the last committed value on blur when left empty", () => {
        const onCommit = jest.fn();
        const { result } = renderHook(() => useEditableQuantity(1, onCommit));

        act(() => {
            result.current.onChange({
                target: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>);
        });

        let committed: number | undefined;

        act(() => {
            committed = result.current.onBlur();
        });

        expect(committed).toBe(1);
        expect(result.current.text).toBe("1");
        expect(onCommit).not.toHaveBeenCalled();
    });

    it("should revert to the last committed value on blur when below min", () => {
        const onCommit = jest.fn();
        const { result } = renderHook(() =>
            useEditableQuantity(1, onCommit, 1),
        );

        act(() => {
            result.current.onChange({
                target: { value: "0" },
            } as React.ChangeEvent<HTMLInputElement>);
        });

        let committed: number | undefined;

        act(() => {
            committed = result.current.onBlur();
        });

        expect(committed).toBe(1);
        expect(result.current.text).toBe("1");
    });

    it("should keep a valid value on blur", () => {
        const onCommit = jest.fn();
        const { result } = renderHook(() => useEditableQuantity(1, onCommit));

        act(() => {
            result.current.onChange({
                target: { value: "8" },
            } as React.ChangeEvent<HTMLInputElement>);
        });

        let committed: number | undefined;

        act(() => {
            committed = result.current.onBlur();
        });

        expect(committed).toBe(8);
    });
});
