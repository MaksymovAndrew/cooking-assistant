// a name part (first or last): a capital first letter then lowercase letters
const NAME_PATTERN = /^[A-ZА-Я][a-zа-я]+$/;
// exactly one @ with no whitespace on either side (no super-linear risk); the backend's zod .email() is the real gate
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;
const MIN_LOGIN_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_HAS_LETTER = /[A-Za-z]/;
const PASSWORD_HAS_DIGIT = /\d/;
const PASSWORD_HAS_SPECIAL_CHAR = /[^A-Za-z0-9]/;

export const isValidNamePart = (value: string): boolean =>
    NAME_PATTERN.test(value.trim());

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
