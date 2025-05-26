import { internalHashStore } from "./hash-store";

import type { Writable } from "svelte/store";

export type ActiveTab = "edit" | "chat";
const DEFAULT_ACTIVE_TAB: ActiveTab = "chat";

/**
 * @store activeTab
 * @description Manages the currently active tab ('edit' or 'chat') and syncs it
 * with the URL hash via `internalHashStore`.
 */
export const activeTab: Writable<ActiveTab> = {
    subscribe: (run, invalidate) => {
        const unsubscribe = internalHashStore.subscribe((value) => {
            let currentTab: ActiveTab;
            if (
                value?.activeTab &&
                (value.activeTab === "edit" || value.activeTab === "chat")
            ) {
                currentTab = value.activeTab as ActiveTab;
            } else {
                currentTab = DEFAULT_ACTIVE_TAB;
            }
            run(currentTab);
        }, invalidate);
        return unsubscribe;
    },
    set: (tabValue: ActiveTab) => {
        internalHashStore.update((current) => ({
            ...current,
            activeTab: tabValue,
        }));
    },
    update: (updater: (value: ActiveTab) => ActiveTab) => {
        internalHashStore.update((currentHashContainer) => {
            let currentTab: ActiveTab;
            if (
                currentHashContainer?.activeTab &&
                (currentHashContainer.activeTab === "edit" ||
                    currentHashContainer.activeTab === "chat")
            ) {
                currentTab = currentHashContainer.activeTab as ActiveTab;
            } else {
                currentTab = DEFAULT_ACTIVE_TAB;
            }
            const newTab = updater(currentTab);
            return { ...currentHashContainer, activeTab: newTab };
        });
    },
};
