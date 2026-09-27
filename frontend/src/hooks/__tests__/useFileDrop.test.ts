import { act, fireEvent, renderHook } from "@testing-library/react";

import type { FileDragEvent } from "hooks/useFileDrop";
import { useFileDrop } from "hooks/useFileDrop";

const dragEvent = (types: string[], files: File[] = []) => {
    const preventDefault = jest.fn();
    const event: FileDragEvent = {
        preventDefault,
        dataTransfer: { types, files },
    };

    return { event, preventDefault };
};

const photo = new File(["image"], "dish.png", { type: "image/png" });

describe("useFileDrop", () => {
    it("should mark a file dragged over as dragging and accept it", () => {
        const { result } = renderHook(() => useFileDrop(jest.fn()));
        const { event, preventDefault } = dragEvent(["Files"]);

        act(() => {
            result.current.dropHandlers.onDragEnter(event);
            result.current.dropHandlers.onDragOver(event);
        });

        expect(result.current.isDragging).toBe(true);
        expect(preventDefault).toHaveBeenCalledTimes(2);
    });

    it("should hand the first dropped file over and stop dragging", () => {
        const onFile = jest.fn();
        const { result } = renderHook(() => useFileDrop(onFile));

        act(() => {
            result.current.dropHandlers.onDragEnter(dragEvent(["Files"]).event);
            result.current.dropHandlers.onDrop(
                dragEvent(["Files"], [photo]).event,
            );
        });

        expect(onFile).toHaveBeenCalledWith(photo);
        expect(result.current.isDragging).toBe(false);
    });

    it("should keep dragging while the pointer crosses a child", () => {
        const { result } = renderHook(() => useFileDrop(jest.fn()));
        const { event } = dragEvent(["Files"]);

        act(() => {
            result.current.dropHandlers.onDragEnter(event);
            result.current.dropHandlers.onDragEnter(event);
            result.current.dropHandlers.onDragLeave(event);
        });

        expect(result.current.isDragging).toBe(true);

        act(() => {
            result.current.dropHandlers.onDragLeave(event);
        });

        expect(result.current.isDragging).toBe(false);
    });

    it("should keep a file dropped beside the frame from replacing the page", () => {
        const { unmount } = renderHook(() => useFileDrop(jest.fn()));
        const strayFile = {
            dataTransfer: { types: ["Files"], files: [photo] },
        };

        expect(fireEvent.dragOver(document.body, strayFile)).toBe(false);
        expect(fireEvent.drop(document.body, strayFile)).toBe(false);

        unmount();

        expect(fireEvent.drop(document.body, strayFile)).toBe(true);
    });

    it("should ignore a drag that carries no files", () => {
        const onFile = jest.fn();
        const { result } = renderHook(() => useFileDrop(onFile));
        const { event, preventDefault } = dragEvent(["text/plain"]);

        act(() => {
            result.current.dropHandlers.onDragEnter(event);
            result.current.dropHandlers.onDrop(event);
        });

        expect(result.current.isDragging).toBe(false);
        expect(preventDefault).not.toHaveBeenCalled();
        expect(onFile).not.toHaveBeenCalled();
    });
});
