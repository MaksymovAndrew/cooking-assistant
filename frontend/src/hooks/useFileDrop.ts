import { useEffect, useRef, useState } from "react";

// the part of a React drag event the drop logic reads
export interface FileDragEvent {
    preventDefault: () => void;
    dataTransfer: { types: readonly string[]; files: ArrayLike<File> };
}

// text or a link dragged over the page is not ours to take
const carriesFiles = (event: FileDragEvent) =>
    event.dataTransfer.types.includes("Files");

export const useFileDrop = (onFile: (file: File) => void) => {
    const [isDragging, setIsDragging] = useState(false);
    // enter and leave fire for every child the pointer crosses, so only the outermost pair counts
    const depthRef = useRef(0);

    // a file that misses the frame would otherwise replace the page, unsaved form and all
    useEffect(() => {
        const swallowStrayFile = (event: DragEvent) => {
            if (event.dataTransfer?.types.includes("Files")) {
                event.preventDefault();
            }
        };

        window.addEventListener("dragover", swallowStrayFile);
        window.addEventListener("drop", swallowStrayFile);

        return () => {
            window.removeEventListener("dragover", swallowStrayFile);
            window.removeEventListener("drop", swallowStrayFile);
        };
    }, []);

    const onDragEnter = (event: FileDragEvent) => {
        if (!carriesFiles(event)) {
            return;
        }

        event.preventDefault();
        depthRef.current += 1;
        setIsDragging(true);
    };

    // without it the browser refuses the drop and opens the file instead
    const onDragOver = (event: FileDragEvent) => {
        if (carriesFiles(event)) {
            event.preventDefault();
        }
    };

    const onDragLeave = (event: FileDragEvent) => {
        if (!carriesFiles(event)) {
            return;
        }

        depthRef.current = Math.max(0, depthRef.current - 1);

        if (depthRef.current === 0) {
            setIsDragging(false);
        }
    };

    const onDrop = (event: FileDragEvent) => {
        if (!carriesFiles(event)) {
            return;
        }

        event.preventDefault();
        depthRef.current = 0;
        setIsDragging(false);

        const files = Array.from(event.dataTransfer.files);

        if (files.length > 0) {
            onFile(files[0]);
        }
    };

    return {
        isDragging,
        dropHandlers: { onDragEnter, onDragOver, onDragLeave, onDrop },
    };
};
