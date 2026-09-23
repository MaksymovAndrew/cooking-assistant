import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { imageFileProblem } from "utils/imageFileProblem";
import type { MediaSize } from "utils/mediaUrl";
import { mediaUrl } from "utils/mediaUrl";

interface Draft {
    file: File | null;
    previewUrl: string | null;
    removed: boolean;
}

export interface PhotoDraftActions {
    upload: (file: File) => Promise<unknown>;
    clear: () => Promise<unknown>;
}

const EMPTY_DRAFT: Draft = { file: null, previewUrl: null, removed: false };

// a photo picked in a form is only a draft until the form itself is saved, so cancelling it
// leaves the stored photo untouched
export const usePhotoDraft = (
    initialKey: string | null,
    previewSize: MediaSize,
) => {
    const { t } = useTranslation("common");
    const [storedKey, setStoredKey] = useState<string | null>(initialKey);
    const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
    const [error, setError] = useState<string | null>(null);
    // the preview's object URL holds the whole file in memory until it is revoked
    const previewRef = useRef<string | null>(null);

    const swapPreview = useCallback((next: string | null) => {
        if (previewRef.current) {
            URL.revokeObjectURL(previewRef.current);
        }

        previewRef.current = next;
    }, []);

    useEffect(
        () => () => {
            swapPreview(null);
        },
        [swapPreview],
    );

    const choose = (file: File) => {
        const problem = imageFileProblem(file);

        if (problem) {
            setError(t(`apiErrors.${problem}`));

            return;
        }

        const previewUrl = URL.createObjectURL(file);

        swapPreview(previewUrl);
        setError(null);
        setDraft({ file, previewUrl, removed: false });
    };

    const remove = () => {
        swapPreview(null);
        setError(null);
        setDraft({ file: null, previewUrl: null, removed: true });
    };

    const reset = useCallback(
        (key: string | null) => {
            swapPreview(null);
            setStoredKey(key);
            setDraft(EMPTY_DRAFT);
            setError(null);
        },
        [swapPreview],
    );

    const storedSrc = draft.removed ? null : mediaUrl(storedKey, previewSize);
    const isDirty =
        draft.file !== null || (draft.removed && storedKey !== null);

    // a failed request is toasted by the global listener; the form is saved either way
    const commitWith = async ({ upload, clear }: PhotoDraftActions) => {
        if (draft.file) {
            await upload(draft.file);

            return;
        }

        if (draft.removed && storedKey) {
            await clear();
        }
    };

    return {
        src: draft.previewUrl ?? storedSrc,
        error,
        isDirty,
        choose,
        remove,
        reset,
        commitWith,
    };
};
