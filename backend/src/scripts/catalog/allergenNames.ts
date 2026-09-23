// hand-written like the category names in catalogVocabulary.ts - the allergen list is closed, so it never comes from the translation source
import type { ALLERGEN_SLUGS } from "./catalog.types";
import type { Locale } from "./catalogVocabulary";

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
