export type ExpiryTone = "expired" | "warning" | "ok";

export interface ExpiryStatus {
    tone: ExpiryTone;
    days: number;
}

export interface ExpiringIngredient {
    ingredientId: number;
    name: string;
    status: ExpiryStatus;
}
