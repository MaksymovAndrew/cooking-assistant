import type { TFunction } from "i18next";

import type { NewsEntry } from "constants/news";

// the "news" namespace's items.<id>.title/description key shape, shared by every place that renders a NewsEntry (NewsModal, WhatsNewCard)
export const getNewsItemText = (t: TFunction, entry: NewsEntry) => ({
    title: t(`items.${entry.id}.title`),
    description: t(`items.${entry.id}.description`),
});
