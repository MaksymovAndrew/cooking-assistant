import { useState } from "react";

import type { MoveDirection } from "types/reorder";

import { stepMovePair } from "utils/listOrder";

interface DragEventLike {
    preventDefault: () => void;
}

export interface DragRowProps {
    draggable: true;
    onDragStart: () => void;
    onDragOver: (event: DragEventLike) => void;
    onDrop: (event: DragEventLike) => void;
    onDragEnd: () => void;
}

// onReorder(fromId, toId) lands fromId right before toId, for drags and one-step moves alike
export const useDragReorder = (
    ids: number[],
    onReorder: (fromId: number, toId: number) => void,
) => {
    const [draggedId, setDraggedId] = useState<number | null>(null);

    const dragProps = (id: number): DragRowProps => ({
        draggable: true,
        onDragStart: () => {
            setDraggedId(id);
        },
        onDragOver: (event) => {
            event.preventDefault();
        },
        onDrop: (event) => {
            event.preventDefault();

            if (draggedId !== null) {
                onReorder(draggedId, id);
            }

            setDraggedId(null);
        },
        onDragEnd: () => {
            setDraggedId(null);
        },
    });

    const move = (id: number, direction: MoveDirection) => {
        const pair = stepMovePair(ids, id, direction);

        if (pair) {
            onReorder(...pair);
        }
    };

    return { dragProps, move };
};
