import type { RecordPhotoTarget } from "types/media";

import {
    useRemoveRecordPhotoMutation,
    useUploadRecordPhotoMutation,
} from "redux/services/photosApi";

import { usePhotoDraft } from "hooks/usePhotoDraft";

// a new record has no id to attach its photo to yet, so the draft is committed after the save
export const useRecordPhotoDraft = (target: RecordPhotoTarget) => {
    const { commitWith, ...draft } = usePhotoDraft(null, "hero");
    const [uploadRecordPhoto] = useUploadRecordPhotoMutation();
    const [removeRecordPhoto] = useRemoveRecordPhotoMutation();

    const commit = (id: number) =>
        commitWith({
            upload: (file) => uploadRecordPhoto({ target, id, file }),
            clear: () => removeRecordPhoto({ target, id }),
        });

    return { ...draft, commit };
};
