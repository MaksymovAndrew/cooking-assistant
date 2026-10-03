type ClassName = string | false | null | undefined;

export const cx = (...classNames: ClassName[]): string =>
    classNames.filter(Boolean).join(" ");
