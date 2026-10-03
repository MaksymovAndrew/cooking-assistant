// any alphabet: a capital first, then letters joined by hyphens or apostrophes
const NAME_PATTERN = /^\p{Lu}\p{L}*(?:['’-]\p{L}+)*$/u;
const MIN_NAME_LENGTH = 2;
// linear-time on purpose (no ReDoS risk); the backend's zod .email() is the real gate
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;
const MIN_LOGIN_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_HAS_LETTER = /\p{L}/u;
const PASSWORD_HAS_DIGIT = /\d/;
const PASSWORD_HAS_SPECIAL_CHAR = /[^\p{L}\p{N}]/u;
// bcrypt reads only the first 72 bytes, so the server refuses anything longer
const MAX_PASSWORD_BYTES = 72;
const utf8 = new TextEncoder();

export const isValidNamePart = (value: string): boolean => {
    const trimmed = value.trim();

    return trimmed.length >= MIN_NAME_LENGTH && NAME_PATTERN.test(trimmed);
};

export const isValidLogin = (value: string): boolean =>
    value.trim().length >= MIN_LOGIN_LENGTH;

export const isValidEmail = (value: string): boolean => {
    const trimmed = value.trim();
    const domain = trimmed.slice(trimmed.indexOf("@") + 1);

    return EMAIL_PATTERN.test(trimmed) && domain.includes(".");
};

// counted in UTF-8 bytes, not characters: a Cyrillic letter takes two, an emoji four
export const isPasswordTooLong = (value: string): boolean =>
    utf8.encode(value).length > MAX_PASSWORD_BYTES;

export const isValidPassword = (value: string): boolean =>
    value.length >= MIN_PASSWORD_LENGTH &&
    PASSWORD_HAS_LETTER.test(value) &&
    PASSWORD_HAS_DIGIT.test(value) &&
    PASSWORD_HAS_SPECIAL_CHAR.test(value);
