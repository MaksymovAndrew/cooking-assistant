// dev stays relative (same-origin via the Vite proxy, so the httpOnly cookie is first-party)
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";
