import type { AriaAttributes } from "react";
import { createContext, useContext } from "react";

import { joinDescribedBy } from "utils/fieldDescription";

type FieldAria = Pick<AriaAttributes, "aria-describedby" | "aria-invalid">;

interface FormFieldControl {
    describedBy: string | undefined;
    invalid: boolean;
}

export const FormFieldContext = createContext<FormFieldControl | null>(null);

export const useFormFieldAria = (own: FieldAria): FieldAria => {
    const field = useContext(FormFieldContext);

    return {
        "aria-describedby": joinDescribedBy(
            own["aria-describedby"],
            field?.describedBy,
        ),
        "aria-invalid":
            own["aria-invalid"] ?? (field?.invalid ? true : undefined),
    };
};
