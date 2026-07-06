import { ListFilter } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { RecipeTypeSummary } from "types/recipeType";

import type { RecipeFilterState } from "hooks/useRecipeListView";

import { SearchComponent } from "components/ui/SearchComponent";

import styles from "./RecipeFilterPanel.module.scss";
import { RecipeFilterPopover } from "./RecipeFilterPopover";

export interface RecipeFilterPanelProps {
    filters: RecipeFilterState;
    setSelectedTypes: (types: number[]) => void;
    setMinCookingTime: (time: string) => void;
    setMaxCookingTime: (time: string) => void;
    setSortOrder: (order: string) => void;
    types: RecipeTypeSummary[];
    searchPlaceholder: string;
}

const FILTER_ICON_SIZE = 17;

export const RecipeFilterPanel: React.FC<RecipeFilterPanelProps> = ({
    filters,
    setSelectedTypes,
    setMinCookingTime,
    setMaxCookingTime,
    setSortOrder,
    types,
    searchPlaceholder,
}) => {
    const { t } = useTranslation("recipes");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeCount =
        filters.selectedTypes.length +
        (filters.minCookingTime ? 1 : 0) +
        (filters.maxCookingTime ? 1 : 0);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleClickOutside = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef} className={styles["recipe-filter-panel"]}>
            <SearchComponent placeholder={searchPlaceholder} />
            <button
                type="button"
                onClick={() => {
                    setIsOpen((prev) => !prev);
                }}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                className={[
                    styles["recipe-filter-panel__trigger"],
                    activeCount > 0 &&
                        styles["recipe-filter-panel__trigger--active"],
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <ListFilter size={FILTER_ICON_SIZE} aria-hidden="true" />
                {t("filterPanel.title")}
                {activeCount > 0 && (
                    <span className={styles["recipe-filter-panel__badge"]}>
                        {activeCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <RecipeFilterPopover
                    filters={filters}
                    setSelectedTypes={setSelectedTypes}
                    setMinCookingTime={setMinCookingTime}
                    setMaxCookingTime={setMaxCookingTime}
                    setSortOrder={setSortOrder}
                    types={types}
                    onClose={() => {
                        setIsOpen(false);
                    }}
                />
            )}
        </div>
    );
};
