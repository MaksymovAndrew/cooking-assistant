import React from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "redux/hooks";
import { selectViewerCapabilities } from "redux/selectors/viewerSelectors";
import { useGetTagsQuery } from "redux/services/tagsApi";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";
import { FilterChipGroup } from "components/ui/FilterChipGroup";

interface RecipeTagsFilterProps {
    value: number[];
    onChange: (next: number[]) => void;
}

// tags are private, so the section is skipped for a guest and for anyone who has none yet
export const RecipeTagsFilter: React.FC<RecipeTagsFilterProps> = ({
    value,
    onChange,
}) => {
    const { t } = useTranslation("tags");
    const { canTag } = useAppSelector(selectViewerCapabilities);
    const { data: tags = [] } = useGetTagsQuery(null, { skip: !canTag });

    if (tags.length === 0) {
        return null;
    }

    return (
        <div className={styles["recipe-filter-panel__section"]}>
            <span className={styles["recipe-filter-panel__label"]}>
                {t("filter.label")}
            </span>
            <FilterChipGroup
                options={tags.map((tag) => ({ id: tag.id, label: tag.name }))}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};
