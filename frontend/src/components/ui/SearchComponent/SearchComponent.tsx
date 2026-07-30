import { Search } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import styles from "./SearchComponent.module.scss";

interface SearchComponentProps {
    placeholder: string;
    value: string;
    onSubmit: (value: string) => void;
}

const SEARCH_ICON_SIZE = 18;

export const SearchComponent: React.FC<SearchComponentProps> = ({
    placeholder,
    value,
    onSubmit,
}) => {
    const [searchTerm, setSearchTerm] = useState(value);
    const [syncedValue, setSyncedValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    // stays local while typing, resyncs when the committed value changes from elsewhere (a chip or a reset clearing it) - adjusted during render, not via an effect
    if (value !== syncedValue) {
        setSyncedValue(value);
        setSearchTerm(value);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSubmit(searchTerm);
            if (inputRef.current) {
                inputRef.current.blur();
            }
        }
    };

    const handleReset = () => {
        setSearchTerm("");
        onSubmit("");
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
