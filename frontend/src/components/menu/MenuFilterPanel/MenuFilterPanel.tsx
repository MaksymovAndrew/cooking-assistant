import { ListFilter } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { MenuCategory } from "types/menu";

import { usePopoverDismiss } from "hooks/usePopoverDismiss";
import { useScrollLock } from "hooks/useScrollLock";

import { SearchComponent } from "components/ui/SearchComponent";

import { MenuCategoryToggle } from "./MenuCategoryToggle";
import styles from "./MenuFilterPanel.module.scss";

interface MenuFilterPanelProps {
    categories: MenuCategory[];
    selectedCategories: number[];
    setSelectedCategories: (categories: number[]) => void;
    searchPlaceholder: string;
}

const FILTER_ICON_SIZE = 17;

export const MenuFilterPanel: React.FC<MenuFilterPanelProps> = ({
    categories,
    selectedCategories,
    setSelectedCategories,
    searchPlaceholder,
}) => {
    const { t } = useTranslation("menu");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const closePopover = () => {
        setIsOpen(false);
    };

    usePopoverDismiss(containerRef, isOpen, closePopover);
    useScrollLock(isOpen);

    const toggleCategory = (id: number) => {
        setSelectedCategories(
            selectedCategories.includes(id)
                ? selectedCategories.filter((value) => value !== id)
                : [...selectedCategories, id],
        );
    };

    return (
        <div ref={containerRef} className={styles["menu-filter-panel"]}>
            <SearchComponent placeholder={searchPlaceholder} />
            <button
                type="button"
                onClick={() => {
                    setIsOpen((prev) => !prev);
                }}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                className={[
                    styles["menu-filter-panel__trigger"],
                    selectedCategories.length > 0 &&
                        styles["menu-filter-panel__trigger--active"],
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <ListFilter size={FILTER_ICON_SIZE} aria-hidden="true" />
                {t("categoryFilter.filter")}
                {selectedCategories.length > 0 && (
                    <span className={styles["menu-filter-panel__badge"]}>
                        {selectedCategories.length}
                    </span>
                )}
            </button>
            {isOpen && (
                <div
                    role="dialog"
                    aria-label={t("categoryFilter.filter")}
                    className={styles["menu-filter-panel__popover"]}
                >
                    <div className={styles["menu-filter-panel__categories"]}>
                        {categories.map((category) => (
                            <MenuCategoryToggle
                                key={category.menu_category_id}
                                label={category.category_name}
                                selected={selectedCategories.includes(
                                    category.menu_category_id,
                                )}
                                onToggle={() => {
                                    toggleCategory(category.menu_category_id);
                                }}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedCategories([]);
                        }}
                        className={styles["menu-filter-panel__reset-button"]}
                    >
                        {t("categoryFilter.reset")}
                    </button>
                </div>
            )}
        </div>
    );
};
