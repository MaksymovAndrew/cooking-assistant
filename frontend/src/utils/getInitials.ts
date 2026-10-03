export const getInitials = (name: string, surname: string): string =>
    `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
