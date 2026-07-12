// two-letter initials for the account avatar, e.g. ("Claude", "Cook") -> "CC"
export const getInitials = (name: string, surname: string): string =>
    `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
