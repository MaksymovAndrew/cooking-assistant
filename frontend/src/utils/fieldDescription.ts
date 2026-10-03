// undefined leaves the aria-describedby attribute off
export const joinDescribedBy = (
    ...ids: (string | null | undefined)[]
): string | undefined => ids.filter(Boolean).join(" ") || undefined;

export const fieldHintId = (fieldId: string): string => `${fieldId}-hint`;

export const fieldErrorId = (fieldId: string): string => `${fieldId}-error`;
