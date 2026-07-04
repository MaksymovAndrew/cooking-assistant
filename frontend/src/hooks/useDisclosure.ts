import { useCallback, useState } from "react";

interface Disclosure {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

// stable via useCallback so consumers can forward these into another hook's deps array safely
export const useDisclosure = (initialOpen = false): Disclosure => {
    const [isOpen, setIsOpen] = useState(initialOpen);

    const open = useCallback(() => {
        setIsOpen(true);
    }, []);
    const close = useCallback(() => {
        setIsOpen(false);
    }, []);
    const toggle = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return { isOpen, open, close, toggle };
};
