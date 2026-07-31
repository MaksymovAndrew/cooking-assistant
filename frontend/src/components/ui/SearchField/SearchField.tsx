import { Search, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useDebouncedValue } from "hooks/useDebouncedValue";

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

// single search input for every list/picker surface: instant typing feedback, but the
// committed value only fires debounceMs after the user stops - so a URL-backed caller
// (RecipeFilterPanel) doesn't spam history, and a client-filtered caller (RecipePicker)
// doesn't re-filter on every keystroke. Forwards its ref so a caller can refocus the
// input after handling a selection (e.g. picking a picker result)
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

        // resyncs local state when the committed value changes from outside (a chip or a reset clearing it) - adjusted during render, not via an effect
        if (value !== syncedValue) {
            setSyncedValue(value);
            setInputValue(value);
        }

        // only fires once the debounce has actually settled on the current input -
        // comparing against inputValue (not just value) means a mid-debounce external
        // reset can't leak a stale onChange call once its own pending timer catches up
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
            <div
                className={[styles["search-field"], className]
                    .filter(Boolean)
                    .join(" ")}
            >
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
