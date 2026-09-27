// building an Intl formatter is far slower than using one, and lists format the same shape many times
const dateFormats = new Map<string, Intl.DateTimeFormat>();
const numberFormats = new Map<string, Intl.NumberFormat>();

const cacheKey = (
    locale: string,
    options: Intl.DateTimeFormatOptions | Intl.NumberFormatOptions,
): string => `${locale}|${JSON.stringify(options)}`;

export const formatDate = (
    date: Date | string,
    locale: string,
    options: Intl.DateTimeFormatOptions,
): string => {
    const key = cacheKey(locale, options);
    let format = dateFormats.get(key);

    if (!format) {
        format = new Intl.DateTimeFormat(locale, options);
        dateFormats.set(key, format);
    }

    return format.format(new Date(date));
};

export const formatNumber = (
    value: number,
    locale: string,
    options: Intl.NumberFormatOptions = {},
): string => {
    const key = cacheKey(locale, options);
    let format = numberFormats.get(key);

    if (!format) {
        format = new Intl.NumberFormat(locale, options);
        numberFormats.set(key, format);
    }

    return format.format(value);
};
