import type { KeyboardEvent, RefObject } from "react";
import { useEffect } from "react";

import { menuKeyStep, menuKeyTarget } from "utils/menuKeyboard";

const ITEM_SELECTOR = "a[href], button:not([disabled])";

// the menu's own items, not those of a menu opened inside it
const menuItems = (menu: HTMLElement): HTMLElement[] =>
    Array.from(menu.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
        (item) => item.closest('[role="menu"]') === menu,
    );

// an item hidden at this width refuses focus, so the search walks on to the next one
const focusAvailable = (items: HTMLElement[], start: number, step: 1 | -1) => {
    for (let offset = 0; offset < items.length; offset += 1) {
        const item =
            items[(start + step * offset + items.length) % items.length];

        item.focus();

        if (document.activeElement === item) {
            return;
        }
    }
};

export const useMenuArrowKeys = (menuRef: RefObject<HTMLElement | null>) => {
    useEffect(() => {
        const menu = menuRef.current;

        if (menu) {
            focusAvailable(menuItems(menu), 0, 1);
        }
    }, [menuRef]);

    return (event: KeyboardEvent<HTMLElement>) => {
        const menu = menuRef.current;

        // a nested menu has already handled its own keys
        if (event.defaultPrevented || !menu) {
            return;
        }

        const items = menuItems(menu);
        const index = items.findIndex(
            (item) => item === document.activeElement,
        );
        const target = menuKeyTarget(event.key, index, items.length);

        if (target !== null) {
            event.preventDefault();
            focusAvailable(items, target, menuKeyStep(event.key));
        }
    };
};
