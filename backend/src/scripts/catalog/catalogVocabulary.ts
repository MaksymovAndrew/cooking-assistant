// hand-written translations for the closed vocabularies (categories, allergens, units) - unlike ingredient names these never come from the translation source, cross-checked against catalog.types.ts's key lists at generation time
import type { ALLERGEN_SLUGS, CATEGORY_KEYS, UNIT_KEYS } from "./catalog.types";

export type Locale = "en" | "ru" | "uk" | "pl";
export const LOCALES: Locale[] = ["en", "ru", "uk", "pl"];

export const CATEGORY_NAMES: Record<
    (typeof CATEGORY_KEYS)[number],
    Record<Locale, string>
> = {
    vegetables: { en: "Vegetables", ru: "Овощи", uk: "Овочі", pl: "Warzywa" },
    fruits: { en: "Fruits", ru: "Фрукты", uk: "Фрукти", pl: "Owoce" },
    berries: { en: "Berries", ru: "Ягоды", uk: "Ягоди", pl: "Jagody" },
    herbs: {
        en: "Herbs",
        ru: "Зелень и травы",
        uk: "Зелень і трави",
        pl: "Zioła",
    },
    mushrooms: { en: "Mushrooms", ru: "Грибы", uk: "Гриби", pl: "Grzyby" },
    meat: { en: "Meat", ru: "Мясо", uk: "М'ясо", pl: "Mięso" },
    offal: { en: "Offal", ru: "Субпродукты", uk: "Субпродукти", pl: "Podroby" },
    poultry: { en: "Poultry", ru: "Птица", uk: "Птиця", pl: "Drób" },
    fish: { en: "Fish", ru: "Рыба", uk: "Риба", pl: "Ryby" },
    seafood: {
        en: "Seafood",
        ru: "Морепродукты",
        uk: "Морепродукти",
        pl: "Owoce morza",
    },
    dairy: {
        en: "Dairy",
        ru: "Молочные продукты",
        uk: "Молочні продукти",
        pl: "Nabiał",
    },
    eggs: { en: "Eggs", ru: "Яйца", uk: "Яйця", pl: "Jajka" },
    cheese: { en: "Cheese", ru: "Сыры", uk: "Сири", pl: "Sery" },
    grains_legumes: {
        en: "Grains & Legumes",
        ru: "Крупы и бобовые",
        uk: "Крупи та бобові",
        pl: "Kasze i rośliny strączkowe",
    },
    pasta: { en: "Pasta", ru: "Паста", uk: "Паста", pl: "Makarony" },
    flour_baking: {
        en: "Flour & Baking",
        ru: "Мука и выпечка",
        uk: "Борошно та випічка",
        pl: "Mąka i wypieki",
    },
    nuts_seeds: {
        en: "Nuts & Seeds",
        ru: "Орехи и семена",
        uk: "Горіхи та насіння",
        pl: "Orzechy i nasiona",
    },
    oils_fats: {
        en: "Oils & Fats",
        ru: "Масла и жиры",
        uk: "Олії та жири",
        pl: "Oleje i tłuszcze",
    },
    spices: { en: "Spices", ru: "Специи", uk: "Спеції", pl: "Przyprawy" },
    sauces_vinegars: {
        en: "Sauces & Vinegars",
        ru: "Соусы и уксусы",
        uk: "Соуси та оцти",
        pl: "Sosy i octy",
    },
    sweeteners: {
        en: "Sweeteners",
        ru: "Подсластители",
        uk: "Підсолоджувачі",
        pl: "Słodziki",
    },
    canned: {
        en: "Canned Goods",
        ru: "Консервы",
        uk: "Консерви",
        pl: "Konserwy",
    },
    beverages: { en: "Beverages", ru: "Напитки", uk: "Напої", pl: "Napoje" },
};

export const ALLERGEN_NAMES: Record<
    (typeof ALLERGEN_SLUGS)[number],
    Record<Locale, string>
> = {
    gluten: { en: "Gluten", ru: "Глютен", uk: "Глютен", pl: "Gluten" },
    crustaceans: {
        en: "Crustaceans",
        ru: "Ракообразные",
        uk: "Ракоподібні",
        pl: "Skorupiaki",
    },
    eggs: { en: "Eggs", ru: "Яйца", uk: "Яйця", pl: "Jaja" },
    fish: { en: "Fish", ru: "Рыба", uk: "Риба", pl: "Ryby" },
    peanuts: {
        en: "Peanuts",
        ru: "Арахис",
        uk: "Арахіс",
        pl: "Orzeszki ziemne",
    },
    soybeans: { en: "Soybeans", ru: "Соя", uk: "Соя", pl: "Soja" },
    milk: { en: "Milk", ru: "Молоко", uk: "Молоко", pl: "Mleko" },
    nuts: { en: "Tree nuts", ru: "Орехи", uk: "Горіхи", pl: "Orzechy" },
    celery: { en: "Celery", ru: "Сельдерей", uk: "Селера", pl: "Seler" },
    mustard: { en: "Mustard", ru: "Горчица", uk: "Гірчиця", pl: "Gorczyca" },
    sesame: { en: "Sesame", ru: "Кунжут", uk: "Кунжут", pl: "Sezam" },
    sulphites: {
        en: "Sulphites",
        ru: "Сульфиты",
        uk: "Сульфіти",
        pl: "Siarczyny",
    },
    lupin: { en: "Lupin", ru: "Люпин", uk: "Люпин", pl: "Łubin" },
    molluscs: { en: "Molluscs", ru: "Моллюски", uk: "Молюски", pl: "Mięczaki" },
};

export const UNIT_NAMES: Record<
    (typeof UNIT_KEYS)[number],
    Record<Locale, string>
> = {
    g: { en: "gram", ru: "грамм", uk: "грам", pl: "gram" },
    kg: { en: "kilogram", ru: "килограмм", uk: "кілограм", pl: "kilogram" },
    ml: { en: "milliliter", ru: "миллилитр", uk: "мілілітр", pl: "mililitr" },
    l: { en: "liter", ru: "литр", uk: "літр", pl: "litr" },
    tsp: { en: "tsp", ru: "ч. л.", uk: "ч. л.", pl: "łyżeczka" },
    tbsp: { en: "tbsp", ru: "ст. л.", uk: "ст. л.", pl: "łyżka" },
    piece: { en: "piece", ru: "шт.", uk: "шт.", pl: "szt." },
    clove: { en: "clove", ru: "зубчик", uk: "зубчик", pl: "ząbek" },
    bunch: { en: "bunch", ru: "пучок", uk: "пучок", pl: "pęczek" },
    sprig: { en: "sprig", ru: "веточка", uk: "гілочка", pl: "gałązka" },
    slice: { en: "slice", ru: "ломтик", uk: "скибка", pl: "kromka" },
    head: { en: "head", ru: "головка", uk: "головка", pl: "główka" },
    can: { en: "can", ru: "банка", uk: "банка", pl: "puszka" },
    package: {
        en: "package",
        ru: "упаковка",
        uk: "упаковка",
        pl: "opakowanie",
    },
};
