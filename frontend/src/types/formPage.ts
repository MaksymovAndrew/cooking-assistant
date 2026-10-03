type FormPageMode = "create" | "change";

// the i18n key prefix a shared form reads its copy from: createRecipePage, changeMenuPage, ...
export type FormPageKey<Record extends "Recipe" | "Menu"> =
    `${FormPageMode}${Record}Page`;
