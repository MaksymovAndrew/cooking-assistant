import { useCallback, useState } from "react";

import { useGetMeQuery } from "redux/services/authApi";

import { useResendVerificationCooldown } from "hooks/useResendVerificationCooldown";

// not persisted on purpose: "Later" hides the nudge for this visit only
export const useEmailVerificationNudge = () => {
    const { data: currentUser } = useGetMeQuery(null);
    const { send, isOnCooldown } = useResendVerificationCooldown();
    const [dismissed, setDismissed] = useState(false);

    const isVerified = Boolean(currentUser?.email_verified_at);
    const show = Boolean(currentUser) && !isVerified && !dismissed;

    const dismiss = useCallback(() => {
        setDismissed(true);
    }, []);

    return { show, sendEmail: send, isSendDisabled: isOnCooldown, dismiss };
};
