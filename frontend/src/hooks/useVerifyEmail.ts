import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useConfirmEmailMutation, useGetMeQuery } from "redux/services/authApi";

export type VerifyEmailStatus = "loading" | "success" | "invalid";

export const useVerifyEmail = (): {
    status: VerifyEmailStatus;
    isAuthed: boolean;
} => {
    const [searchParams] = useSearchParams();
    const [confirmEmail] = useConfirmEmailMutation();
    // /api/me is exempt from the global 401 redirect, so this is safe to call whether or not the browser already has a session
    const { data: currentUser } = useGetMeQuery(null);
    const token = searchParams.get("token") ?? "";
    const [status, setStatus] = useState<VerifyEmailStatus>(
        token ? "loading" : "invalid",
    );

    useEffect(() => {
        if (!token) {
            return undefined;
        }

        let cancelled = false;

        confirmEmail({ token })
            .then((result) => {
                if (!cancelled) {
                    setStatus("data" in result ? "success" : "invalid");
                }
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [confirmEmail, token]);

    return { status, isAuthed: Boolean(currentUser) };
};
