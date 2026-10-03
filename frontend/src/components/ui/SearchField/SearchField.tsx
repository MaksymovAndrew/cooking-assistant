import { Search, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useDebouncedValue } from "hooks/useDebouncedValue";

import { cx } from "utils/cx";

import styles from "./SearchField.module.scss";

interface SearchFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    id?: string;
    debounceMs?: number;
    onFocus?: () => void;
    className?: string;
}

const DEFAULT_DEBOUNCE_MS = 300;
const SEARCH_ICON_SIZE = 17;
const CLEAR_ICON_SIZE = 13;

export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
    (
        {
            value,
            onChange,
            placeholder,
            id,
            debounceMs = DEFAULT_DEBOUNCE_MS,
            onFocus,
            className,
        },
        ref,
    ) => {
        const { t } = useTranslation();
        const [inputValue, setInputValue] = useState(value);
        const [syncedValue, setSyncedValue] = useState(value);
        const inputRef = useRef<HTMLInputElement>(null);
        const debouncedValue = useDebouncedValue(inputValue, debounceMs);

        const setRefs = (node: HTMLInputElement | null) => {
            inputRef.current = node;

            if (typeof ref === "function") {
                ref(node);
            } else if (ref) {
                ref.current = node;
            }
        };

        // an outside change (a chip or a reset) resyncs the input during render, not in an effect
        if (value !== syncedValue) {
            setSyncedValue(value);
            setInputValue(value);
        }

        // checking inputValue too stops a stale debounce from firing after a mid-debounce reset
        useEffect(() => {
            if (debouncedValue === inputValue && debouncedValue !== value) {
                onChange(debouncedValue);
            }
        }, [debouncedValue, inputValue, value, onChange]);

        const handleClear = () => {
            setInputValue("");
            onChange("");
            inputRef.current?.focus();
        };

        return (
            <div className={cx(styles["search-field"], className)}>
                <Search
                    size={SEARCH_ICON_SIZE}
                    aria-hidden="true"
                    className={styles["search-field__icon"]}
                />
                <input
                    id={id}
                    ref={setRefs}
                    type="text"
                    autoComplete="off"
                    value={inputValue}
                    onFocus={onFocus}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                    }}
                    placeholder={placeholder}
                    className={styles["search-field__input"]}
                />
                {inputValue && (
                    <button
                        type="button"
                        aria-label={t("search.clear")}
                        onClick={handleClear}
                        className={styles["search-field__clear"]}
                    >
                        <X size={CLEAR_ICON_SIZE} aria-hidden="true" />
                    </button>
                )}
            </div>
        );
    },
);

SearchField.displayName = "SearchField";
