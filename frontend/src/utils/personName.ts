import { getInitials } from "utils/getInitials";

interface PersonName {
    name?: string;
    surname?: string;
    login?: string;
}

export const personDisplayName = ({
    name,
    surname,
    login,
}: PersonName): string | undefined =>
    name && surname ? `${name} ${surname}` : login;

// undefined lets the avatar fall back to its preset or placeholder
export const personInitials = ({
    name,
    surname,
}: PersonName): string | undefined =>
    name && surname ? getInitials(name, surname) : undefined;
