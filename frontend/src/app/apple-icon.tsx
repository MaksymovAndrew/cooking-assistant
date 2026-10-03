import { ImageResponse } from "next/og";

import { APP_ICON_TYPE, APPLE_ICON_SIZE } from "constants/appIcons";

import { AppIcon } from "components/social/AppIcon";

export const size = { width: APPLE_ICON_SIZE, height: APPLE_ICON_SIZE };

export const contentType = APP_ICON_TYPE;

const AppleIcon = () =>
    new ImageResponse(<AppIcon size={APPLE_ICON_SIZE} />, size);

export default AppleIcon;
