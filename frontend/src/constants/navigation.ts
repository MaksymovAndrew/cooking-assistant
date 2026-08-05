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

// shared items, reused across the authed/guest x top-bar/bottom-bar variants below
const RECIPES_ITEM: NavItem = {
    to: ROUTES.allRecipes,
    labelKey: "nav.recipes",
    Icon: BookMark,
};
const MENUS_ITEM: NavItem = {
    to: ROUTES.allMenus,
    labelKey: "nav.menus",
    Icon: NotebookMark,
};
const INGREDIENTS_ITEM: NavItem = {
    to: ROUTES.ingredients,
    labelKey: "nav.ingredients",
    Icon: BasketMark,
};
const STATS_ITEM: NavItem = {
    to: ROUTES.stats,
    labelKey: "nav.stats",
    Icon: BarChartMark,
};
const PROFILE_ITEM: NavItem = {
    to: ROUTES.profile,
    labelKey: "nav.profile",
    Icon: UserCircleMark,
};
const LOGIN_ITEM: NavItem = {
    to: ROUTES.login,
    labelKey: "nav.login",
    Icon: UserCircleMark,
};

// desktop top-bar nav - Recipes / Menus / Ingredients / Stats only; My Menus and My Recipes live under Profile instead
export const NAV_ITEMS: NavItem[] = [
    RECIPES_ITEM,
    MENUS_ITEM,
    INGREDIENTS_ITEM,
    STATS_ITEM,
];

// tablet/mobile bottom bar - a fixed 5-tab order (Stats, Menus, Recipes, Pantry, Profile) that replaces the desktop top nav on narrow screens; Settings is reachable from Profile instead, it's easy enough to find there
export const BOTTOM_NAV_ITEMS: NavItem[] = [
    STATS_ITEM,
    MENUS_ITEM,
    RECIPES_ITEM,
    INGREDIENTS_ITEM,
    PROFILE_ITEM,
];

// guest desktop top-bar nav - only the sections a guest can actually reach
export const GUEST_NAV_ITEMS: NavItem[] = [RECIPES_ITEM, MENUS_ITEM];

// guest tablet/mobile bottom bar - three tabs, not five: Ingredients/Stats/Profile are all
// account-only, replaced by a single Log In tab
export const GUEST_BOTTOM_NAV_ITEMS: NavItem[] = [
    RECIPES_ITEM,
    MENUS_ITEM,
    LOGIN_ITEM,
];
