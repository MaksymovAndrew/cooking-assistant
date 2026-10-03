import type { ImageVariant } from "./ImageProcessor";

export interface MediaStorage {
    save(key: string, variants: ImageVariant[]): Promise<void>;
    // never throws: the record is already gone, so a leftover file beats a failed request
    remove(key: string): Promise<void>;
    locate(fileName: string): Promise<string | null>;
}
