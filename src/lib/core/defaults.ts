import type { GridMapShape } from "./grid-map";

/**
 * Default dimensions (rows, columns) for the grid map.
 *
 * **Usage**: Initializes the `gridSize` property in the `mapSize` store (see `src/lib/store/map-size.ts`).
 * This store's value is used by components that set up or display the grid,
 * potentially including `Header.svelte` (via its initial state which might be derived from this store)
 * or a dedicated size updating component.
 */
export const DEFAULT_MAP_SIZE: GridMapShape = [16, 16];

/**
 * Default display dimensions (width, height in pixels) for the map's visual representation.
 *
 * **Usage**: Initializes the `pixelSize` property in the `mapSize` store (see `src/lib/store/map-size.ts`).
 * This determines the initial rendering size (e.g., of an HTML5 canvas or SVG container) for the map grid.
 * Components responsible for drawing the map would use this value from the store.
 */
export const DEFAULT_MAP_PIXEL_SIZE: GridMapShape = [500, 500];

/**
 * Default value for step-based parameters, such as tool radius or discrete movement increments.
 *
 * **Usage**: Initializes application state related to step-based controls.
 * For instance, it might set an initial `numSteps` value (e.g., in the state of `Header.svelte`)
 * which is then passed to the `Toolbar` component as the `defaultStep` prop,
 * influencing UI elements like sliders for tool size or step adjustments.
 * (Context: `Header.svelte` uses `this.state.numSteps` for `Toolbar`'s `defaultStep` prop,
 * and `this.state.toolRadius` for `defaultSelected` related to step size).
 */
export const DEFAULT_NUM_STEPS = 1;

/**
 * Maximum number of grid states to retain in the history for undo/redo operations.
 * This limits how many past actions a user can revert or reapply.
 *
 * **Usage**: Defines the capacity of the undo/redo stack within the application's history management system.
 * UI interactions, such as clicking undo/redo buttons in `Header.svelte` (which calls `handleUndoRedo`),
 * operate on this history system, which adheres to this maximum length.
 */
export const MAX_GRID_HISTORY_LENGTH = 20;
