export const firstInvalidField = (root: ParentNode): HTMLElement | null =>
    root.querySelector<HTMLElement>('[aria-invalid="true"]');
