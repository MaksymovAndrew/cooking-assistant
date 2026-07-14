import { useCallback, useState } from "react";

import { useGetMeQuery } from "redux/services/authApi";

import { useResendVerificationCooldown } from "hooks/useResendVerificationCooldown";

// dismiss is component-state only (not persisted) - "Later" just hides it for this session, not forever
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
