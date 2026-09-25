// a name part (first or last) in any alphabet: a capital first letter, then letters joined by hyphens or apostrophes
const NAME_PATTERN = /^\p{Lu}\p{L}*(?:['’-]\p{L}+)*$/u;
const MIN_NAME_LENGTH = 2;
// exactly one @ with no whitespace on either side (no super-linear risk); the backend's zod .email() is the real gate
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;
const MIN_LOGIN_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_HAS_LETTER = /\p{L}/u;
const PASSWORD_HAS_DIGIT = /\d/;
const PASSWORD_HAS_SPECIAL_CHAR = /[^\p{L}\p{N}]/u;

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

export const isValidPassword = (value: string): boolean =>
    value.length >= MIN_PASSWORD_LENGTH &&
    PASSWORD_HAS_LETTER.test(value) &&
    PASSWORD_HAS_DIGIT.test(value) &&
    PASSWORD_HAS_SPECIAL_CHAR.test(value);
