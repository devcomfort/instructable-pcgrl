import type { GridMap } from "$lib/core";
import { MAX_GRID_HISTORY_LENGTH } from "$lib/core/defaults"; // eslint-disable-line no-unused-vars -- Referenced in JSDoc comments via @link
import { writable } from "svelte/store";

/**
 * A Svelte writable store that maintains a chronological sequence of grid map states
 * for undo/redo functionality in the map editor.
 *
 * This store works in conjunction with {@link historyCursor} and {@link maxHistoryLength}
 * to provide a complete history management system. Each entry in the array represents
 * a snapshot of the grid map at a specific point in time.
 *
 * @store gridHistory
 * @description
 * The `gridHistory` store contains an array of {@link GridMap} objects, where each
 * {@link GridMap} represents a complete state of the game level at a particular moment.
 * This enables users to navigate through their editing history using undo/redo operations.
 *
 * **Structure and Relationship:**
 * - Each element is a {@link GridMap}: A 2D array of numbers representing tile types
 * - The array index corresponds to the temporal order of map states
 * - The {@link historyCursor} store points to the currently active state within this array
 * - Maximum array length is controlled by {@link maxHistoryLength} (default: {@link MAX_GRID_HISTORY_LENGTH})
 *
 * **State Management Workflow:**
 * 1. **Initial State**: Started with an empty array `[]`
 * 2. **Adding States**: New {@link GridMap} states are appended when user performs editing actions
 * 3. **Branching**: If user performs undo operations and then makes new edits,
 *    future states beyond the current {@link historyCursor} position are discarded
 * 4. **Capacity Management**: When history exceeds {@link maxHistoryLength},
 *    oldest states are removed to maintain the limit
 *
 * **Integration with History System:**
 * - {@link historyCursor}: Points to the current active state index in this array
 * - {@link maxHistoryLength}: Defines the maximum number of states to retain
 * - UI Components: History navigation buttons in the toolbar trigger undo/redo operations
 *
 * **Usage Patterns:**
 * ```typescript
 * import { gridHistory, historyCursor } from '$lib/store/history';
 * import { get } from 'svelte/store';
 *
 * // Add a new state to history
 * const currentHistory = get(gridHistory);
 * const currentCursor = get(historyCursor);
 * const newState: GridMap = [[0, 1, 0], [1, 1, 1], [0, 1, 0]];
 *
 * // Truncate future states and add new state
 * const newHistory = [...currentHistory.slice(0, currentCursor + 1), newState];
 * gridHistory.set(newHistory);
 * historyCursor.set(newHistory.length - 1);
 *
 * // Get current state
 * const currentState = get(gridHistory)[get(historyCursor)];
 *
 * // Undo operation
 * const cursor = get(historyCursor);
 * if (cursor > 0) {
 *   historyCursor.set(cursor - 1);
 * }
 *
 * // Redo operation
 * const history = get(gridHistory);
 * const cursor = get(historyCursor);
 * if (cursor < history.length - 1) {
 *   historyCursor.set(cursor + 1);
 * }
 * ```
 *
 * **Data Flow Example:**
 * ```
 * Initial: gridHistory = [], historyCursor = 0
 *
 * After first edit:
 * gridHistory = [State0], historyCursor = 0
 *
 * After second edit:
 * gridHistory = [State0, State1], historyCursor = 1
 *
 * After undo:
 * gridHistory = [State0, State1], historyCursor = 0 (points to State0)
 *
 * After new edit (branching):
 * gridHistory = [State0, NewState], historyCursor = 1 (State1 was discarded)
 * ```
 *
 * @see {@link GridMap} - The type definition for individual grid map states
 * @see {@link historyCursor} - Points to the current active state in this array
 * @see {@link maxHistoryLength} - Defines the maximum capacity of this history array
 * @see {@link MAX_GRID_HISTORY_LENGTH} - The default maximum history length constant
 * @see {@link GridMapSchema} - Zod schema for validating {@link GridMap} structures
 * @see {@link Tileset} - Defines the meaning of numeric values within each {@link GridMap}
 */
export const gridHistory = writable<GridMap[]>([]);
