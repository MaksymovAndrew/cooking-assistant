import { Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
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
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchParams, setSearchParams] = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const initialSearchTerm =
            searchParams.get(SEARCH_PARAM_INGREDIENT_NAME) ?? "";

        setSearchTerm(initialSearchTerm);
    }, [searchParams]);

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
