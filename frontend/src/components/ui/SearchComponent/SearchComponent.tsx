import { Search } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { SEARCH_PARAM_INGREDIENT_NAME } from "constants/queryParams";

import styles from "./SearchComponent.module.scss";

interface SearchComponentProps {
    placeholder: string;
}

const SEARCH_ICON_SIZE = 18;

export const SearchComponent: React.FC<SearchComponentProps> = ({
    placeholder,
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearchTerm = searchParams.get(SEARCH_PARAM_INGREDIENT_NAME) ?? "";
    const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
    const [syncedSearchTerm, setSyncedSearchTerm] = useState(urlSearchTerm);
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    // stays local while typing, resyncs when the URL changes from elsewhere (Enter here, or a chip/reset removing it) - adjusted during render, not via an effect
    if (urlSearchTerm !== syncedSearchTerm) {
        setSyncedSearchTerm(urlSearchTerm);
        setSearchTerm(urlSearchTerm);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setSearchParams({ [SEARCH_PARAM_INGREDIENT_NAME]: searchTerm });
            if (inputRef.current) {
                inputRef.current.blur();
            }
        }
    };

    const handleReset = () => {
        setSearchTerm("");
        setSearchParams({});
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className={styles["search-component"]}>
            <Search
                size={SEARCH_ICON_SIZE}
                aria-hidden="true"
                className={styles["search-component__icon"]}
            />
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder={`${t("search.placeholderPrefix")} ${placeholder}`}
                className={styles["search-component__input"]}
                ref={inputRef}
            />
            {searchTerm && (
                <button
                    type="button"
                    onClick={handleReset}
                    className={styles["search-component__reset"]}
                >
                    {t("search.reset")}
                </button>
            )}
        </div>
    );
};
