import { act, renderHook } from "@testing-library/react";

import { useDragReorder } from "hooks/useDragReorder";

const IDS = [1, 2, 3];

const dropEvent = () => ({ preventDefault: jest.fn() });

describe("useDragReorder", () => {
    it("should reorder the dragged row onto the row it is dropped on", () => {
        const onReorder = jest.fn();
        const { result } = renderHook(() => useDragReorder(IDS, onReorder));

        act(() => {
            result.current.dragProps(1).onDragStart();
        });
        act(() => {
            result.current.dragProps(3).onDrop(dropEvent());
        });

        expect(onReorder).toHaveBeenCalledWith(1, 3);
    });

    it("should not reorder a drop that no drag started", () => {
        const onReorder = jest.fn();
        const { result } = renderHook(() => useDragReorder(IDS, onReorder));
        const event = dropEvent();

        act(() => {
            result.current.dragProps(3).onDrop(event);
        });

        expect(event.preventDefault).toHaveBeenCalled();
        expect(onReorder).not.toHaveBeenCalled();
    });

    it("should forget the dragged row once the drag ends", () => {
        const onReorder = jest.fn();
        const { result } = renderHook(() => useDragReorder(IDS, onReorder));

        act(() => {
            result.current.dragProps(1).onDragStart();
        });
        act(() => {
            result.current.dragProps(1).onDragEnd();
        });
        act(() => {
            result.current.dragProps(3).onDrop(dropEvent());
        });

        expect(onReorder).not.toHaveBeenCalled();
    });

    it("should allow a drop by cancelling the drag-over default", () => {
        const { result } = renderHook(() => useDragReorder(IDS, jest.fn()));
        const event = dropEvent();

        result.current.dragProps(2).onDragOver(event);

        expect(event.preventDefault).toHaveBeenCalled();
    });

    it("should move a row up by landing it before its upper neighbour", () => {
        const onReorder = jest.fn();
        const { result } = renderHook(() => useDragReorder(IDS, onReorder));

        result.current.move(2, -1);

        expect(onReorder).toHaveBeenCalledWith(2, 1);
    });

    it("should move a row down by landing its lower neighbour before it", () => {
        const onReorder = jest.fn();
        const { result } = renderHook(() => useDragReorder(IDS, onReorder));

        result.current.move(2, 1);

        expect(onReorder).toHaveBeenCalledWith(3, 2);
    });

    it("should not reorder a move past the end of the list", () => {
        const onReorder = jest.fn();
        const { result } = renderHook(() => useDragReorder(IDS, onReorder));

        result.current.move(3, 1);

        expect(onReorder).not.toHaveBeenCalled();
    });
});
