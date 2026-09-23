import {
    useRemoveAvatarPhotoMutation,
    useUploadAvatarPhotoMutation,
} from "redux/services/photosApi";

import { usePhotoDraft } from "hooks/usePhotoDraft";

export const useAvatarPhotoDraft = (storedKey: string | null) => {
    const { commitWith, ...draft } = usePhotoDraft(storedKey, "card");
    const [uploadAvatarPhoto] = useUploadAvatarPhotoMutation();
    const [removeAvatarPhoto] = useRemoveAvatarPhotoMutation();

    const commit = () =>
        commitWith({
            upload: (file) => uploadAvatarPhoto(file),
            clear: () => removeAvatarPhoto(null),
        });

    return { ...draft, commit };
};
