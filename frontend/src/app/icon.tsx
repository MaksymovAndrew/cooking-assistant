import { ImageResponse } from "next/og";

import { APP_ICON_SIZES, APP_ICON_TYPE } from "constants/appIcons";

import { AppIcon } from "components/social/AppIcon";

interface IconProps {
    id: Promise<string>;
}

export const generateImageMetadata = () =>
    APP_ICON_SIZES.map((size) => ({
        id: String(size),
        size: { width: size, height: size },
        contentType: APP_ICON_TYPE,
    }));

// Next answers an id it did not generate with a 404 before this runs, so it is always a listed size
const Icon = async ({ id }: IconProps) => {
    const size = Number(await id);

    return new ImageResponse(<AppIcon size={size} />, {
        width: size,
        height: size,
    });
};

export default Icon;
