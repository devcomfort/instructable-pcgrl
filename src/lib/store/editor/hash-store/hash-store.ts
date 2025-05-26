import { createHashStore } from "svelte-hash";

/**
 * @store hashStore
 * @description Manages multiple states synchronized with the URL hash.
 * Currently handles:
 *  - `map`: The GridMap data, stored as a JSON string.
 *  - `activeTab`: The currently active UI tab ('edit' or 'chat').
 *
 * This centralizes svelte-hash initialization to avoid multiple createHashStore calls.
 */
export const internalHashStore = createHashStore<{
    map: string | undefined;
    activeTab: string | undefined;
}>();
