import type React from "react";

import {
    BarChartMark,
    BasketMark,
    BookMark,
    NotebookMark,
    UserCircleMark,
} from "components/icons";

import { ROUTES } from "./routes";

// accepts both lucide-react icons and hand-authored components/icons/* glyphs
export type NavIcon = React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
}>;

export interface NavItem {
    to: string;
    labelKey: string;
    Icon: NavIcon;
}

// desktop top-bar nav - Recipes / Menus / Ingredients / Stats only; My Menus and My Recipes live under Profile instead
export const NAV_ITEMS: NavItem[] = [
    { to: ROUTES.allRecipes, labelKey: "nav.recipes", Icon: BookMark },
    { to: ROUTES.allMenus, labelKey: "nav.menus", Icon: NotebookMark },
    { to: ROUTES.ingredients, labelKey: "nav.ingredients", Icon: BasketMark },
    { to: ROUTES.stats, labelKey: "nav.stats", Icon: BarChartMark },
];

// tablet/mobile bottom bar - a fixed 5-tab order (Stats, Menus, Recipes, Pantry, Profile) that replaces the desktop top nav on narrow screens; Settings is reachable from Profile instead, it's easy enough to find there
export const BOTTOM_NAV_ITEMS: NavItem[] = [
    { to: ROUTES.stats, labelKey: "nav.stats", Icon: BarChartMark },
    { to: ROUTES.allMenus, labelKey: "nav.menus", Icon: NotebookMark },
    { to: ROUTES.allRecipes, labelKey: "nav.recipes", Icon: BookMark },
    { to: ROUTES.ingredients, labelKey: "nav.ingredients", Icon: BasketMark },
    { to: ROUTES.profile, labelKey: "nav.profile", Icon: UserCircleMark },
];
