import { get, type Writable } from "svelte/store";

import type { GridMap } from "$lib/core";
import { defaultMapState } from "./default-map-state";
import { internalHashStore } from "./hash-store";

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

