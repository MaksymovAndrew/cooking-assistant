// jsdom ships neither; axios and the URL helpers used in tests read them at module load
import { TextDecoder, TextEncoder } from "node:util";

Object.assign(globalThis, { TextEncoder, TextDecoder });

// nor object URLs, which the photo picker previews a chosen file through
let objectUrlCount = 0;

Object.assign(URL, {
    createObjectURL: () => {
        objectUrlCount += 1;

        return `blob:test/${objectUrlCount}`;
    },
    revokeObjectURL: () => undefined,
});
