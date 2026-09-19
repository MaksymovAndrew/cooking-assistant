import { selectNotifications } from "redux/selectors/notificationsSelectors";
import type { Notification } from "redux/slices/notificationsSlice";

import { makeTestStore } from "test/store";

describe("notificationsSelectors", () => {
    it("should select the notifications list", () => {
        const items: Notification[] = [
            { id: "a", type: "info", message: "x", link: null },
        ];
        const store = makeTestStore({ notifications: { items } });

        expect(selectNotifications(store.getState())).toEqual(items);
    });
});
