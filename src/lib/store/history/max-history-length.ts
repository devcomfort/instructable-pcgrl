import { MAX_GRID_HISTORY_LENGTH } from "$lib/core/defaults";
import { writable } from "svelte/store";

/**
 * @store maxHistoryLength
 * @description A Svelte writable store that holds the maximum number of history states
 * that can be stored for the grid map. This controls how many undo steps are possible.
 * It is initialized with `MAX_GRID_HISTORY_LENGTH`.
 *
 * @see {@link MAX_GRID_HISTORY_LENGTH}
 */
export const maxHistoryLength = writable(MAX_GRID_HISTORY_LENGTH);
