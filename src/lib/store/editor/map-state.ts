import { createHashStore } from "svelte-hash";
import { get, type Writable } from "svelte/store";

import type { GridMap } from "$lib/core";
import { defaultMapState } from "./default-map-state";

export type ActiveTab = "edit" | "chat";
const DEFAULT_ACTIVE_TAB: ActiveTab = "edit";

/**
 * @store hashStore
 * @description Manages multiple states synchronized with the URL hash.
 * Currently handles:
 *  - `map`: The GridMap data, stored as a JSON string.
 *  - `activeTab`: The currently active UI tab ('edit' or 'chat').
 *
 * This centralizes svelte-hash initialization to avoid multiple createHashStore calls.
 */
const internalHashStore = createHashStore<{
	map: string | undefined;
	activeTab: string | undefined;
}>();

/**
 * @store mapState
 * @description A Svelte store that manages the current state of the game map,
 * synchronized with the URL hash via `internalHashStore`.
 */
export const mapState: Writable<GridMap> = {
	subscribe: (run, invalidate) => {
		const unsubscribe = internalHashStore.subscribe((value) => {
			let currentMap: GridMap;
			if (value?.map) {
				try {
					currentMap = JSON.parse(value.map);
				} catch (e) {
					console.error(
						'[mapState] Failed to parse "map" from hash, using defaultMapState:',
						e,
					);
					currentMap = get(defaultMapState);
				}
			} else {
				currentMap = get(defaultMapState);
			}
			run(currentMap);
		}, invalidate);
		return unsubscribe;
	},
	set: (gridMapValue: GridMap) => {
		try {
			const mapJsonString = JSON.stringify(gridMapValue);
			internalHashStore.update((current) => ({
				...current,
				map: mapJsonString,
			}));
		} catch (e) {
			console.error(
				"[mapState] Failed to stringify GridMap for hash store:",
				e,
			);
		}
	},
	update: (updater: (value: GridMap) => GridMap) => {
		internalHashStore.update((currentHashContainer) => {
			let currentMap: GridMap;
			if (currentHashContainer?.map) {
				try {
					currentMap = JSON.parse(currentHashContainer.map);
				} catch (e) {
					console.error(
						'[mapState] Failed to parse "map" for update, using defaultMapState:',
						e,
					);
					currentMap = get(defaultMapState);
				}
			} else {
				currentMap = get(defaultMapState);
			}

			const newMap = updater(currentMap);

			try {
				const newMapJsonString = JSON.stringify(newMap);
				return { ...currentHashContainer, map: newMapJsonString };
			} catch (e) {
				console.error(
					"[mapState] Failed to stringify updated GridMap for hash store:",
					e,
				);
				return currentHashContainer;
			}
		});
	},
};

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
