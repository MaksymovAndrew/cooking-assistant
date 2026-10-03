import type React from "react";

import {
    AvocadoAvatar,
    BreadAvatar,
    ChefToqueAvatar,
    ChiliAvatar,
    FriedEggAvatar,
    HerbAvatar,
    LemonAvatar,
    MushroomAvatar,
    PotAvatar,
    RamenBowlAvatar,
    SushiAvatar,
    TomatoAvatar,
} from "components/avatars";
import type { IconProps } from "components/icons";

// keep in sync with backend/src/constants/avatarKeys.ts, which validates the keys
export const AVATAR_REGISTRY: Record<string, React.ComponentType<IconProps>> = {
    "chef-toque": ChefToqueAvatar,
    "ramen-bowl": RamenBowlAvatar,
    tomato: TomatoAvatar,
    avocado: AvocadoAvatar,
    "fried-egg": FriedEggAvatar,
    chili: ChiliAvatar,
    mushroom: MushroomAvatar,
    lemon: LemonAvatar,
    sushi: SushiAvatar,
    pot: PotAvatar,
    herb: HerbAvatar,
    bread: BreadAvatar,
};

export const AVATAR_KEYS = Object.keys(AVATAR_REGISTRY);
