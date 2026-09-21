import type { ImageVariant } from "./ImageProcessor";

export interface MediaStorage {
    save(key: string, variants: ImageVariant[]): Promise<void>;
    // never throws: by the time a file is removed its record is already gone, so a leftover file
    // is harmless while a failed request would not be
    remove(key: string): Promise<void>;
    // null when no such file is stored
    locate(fileName: string): Promise<string | null>;
}
