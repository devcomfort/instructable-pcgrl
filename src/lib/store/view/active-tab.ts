import { createHashStore } from "svelte-hash";
import type { Writable } from "svelte/store";

export type ActiveTab = "edit" | "chat";

const DEFAULT_ACTIVE_TAB: ActiveTab = "chat";

/**
 * @store activeTabStore
 * @description Manages the currently active tab (Edit or Chat) and syncs it with the URL hash.
 * The active tab is stored under the key 'activeTab' in the URL hash.
 * Defaults to 'edit' if no valid tab is found in the hash or if parsing fails.
 *
 * Key Features:
 * - URL synchronization: Active tab state is automatically synced with the browser URL hash (e.g., #activeTab=edit).
 * - Persistence: Active tab state survives page refreshes and can be shared via URL.
 * - Type safety: Strongly typed as `Writable<ActiveTab>`.
 * - Robust Parsing: Includes basic error handling.
 */
const internalActiveTabStore = createHashStore<{
	activeTab: string | undefined;
}>();

export const activeTab: Writable<ActiveTab> = {
	subscribe: (run, invalidate) => {
		const unsubscribe = internalActiveTabStore.subscribe((value) => {
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
		internalActiveTabStore.set({ activeTab: tabValue });
	},
	update: (updater: (value: ActiveTab) => ActiveTab) => {
		internalActiveTabStore.update((currentHashContainer) => {
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
			return { activeTab: newTab };
		});
	},
};
