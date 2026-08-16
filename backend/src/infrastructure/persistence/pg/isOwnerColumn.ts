// person_id itself never leaves the server - only whether the viewer owns the row does
export function isOwnerColumn(
    tableAlias: string,
    ownerPlaceholder: string,
): string {
    return `COALESCE(${tableAlias}.person_id = ${ownerPlaceholder}, false) AS "isOwner"`;
}
