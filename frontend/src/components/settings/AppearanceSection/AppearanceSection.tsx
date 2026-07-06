import { Sun } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { useTheme } from "hooks/useTheme";

import { SettingsRow } from "components/settings/SettingsRow";
import { SettingsSection } from "components/settings/SettingsSection";
import { SegmentedControl } from "components/ui/SegmentedControl";

export const AppearanceSection: React.FC = () => {
    const { t } = useTranslation("settings");
    const dispatch = useAppDispatch();
    const { mode } = useTheme();

    const themeOptions = [
        { value: "dark", label: t("appearanceSection.dark") },
        { value: "light", label: t("appearanceSection.light") },
    ] as const;

    return (
        <SettingsSection heading={t("appearanceSection.heading")}>
            <SettingsRow
                icon={Sun}
                title={t("appearanceSection.themeTitle")}
                description={t("appearanceSection.themeDescription")}
            >
                <SegmentedControl
                    label={t("appearanceSection.themeLabel")}
                    options={themeOptions}
                    value={mode}
                    onChange={(nextMode) => {
                        if (nextMode !== mode) {
                            dispatch(
                                openModal({
                                    type: MODAL_TYPE.themeChange,
                                    nextMode,
                                }),
                            );
                        }
                    }}
                />
            </SettingsRow>
        </SettingsSection>
    );
};
