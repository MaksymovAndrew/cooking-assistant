import React from "react";

import { menuDetailsPath } from "constants/routes";

import { ContentCard } from "components/cards/ContentCard";
import { NotebookMark } from "components/icons";

interface MenuCardProps {
    id: number;
    title: string;
    categoryName: string;
    mine?: boolean;
}

export const MenuCard: React.FC<MenuCardProps> = ({
    id,
    title,
    categoryName,
    mine = false,
}) => (
    <ContentCard
        to={menuDetailsPath(id)}
        title={title}
        imageIcon={NotebookMark}
        chipLabel={categoryName}
        mine={mine}
        // the menu list response doesn't include a per-menu recipe count, so
        // the meta row (present in the design) is omitted rather than faked
        metaItems={[]}
    />
);
