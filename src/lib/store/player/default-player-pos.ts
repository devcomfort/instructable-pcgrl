import { derived } from "svelte/store";
import { mapSize } from "$lib/store/generator/map-size";
import type { GridMapShape } from "../../core/grid-map";

/**
 * @store defaultPlayerPos
 * @description A Svelte derived store that calculates the player's default starting position.
 * This position is typically set to the center coordinates ([row, column]) of the game map.
 * It is derived from the `gridSize` (grid dimensions) provided by the `mapSize` store.
 *
 * Calculation Logic:
 * It takes the `gridSize` (total number of rows and columns of the map, e.g., `[10, 20]`).
 * For each dimension (rows, columns), it divides the size by 2 and then rounds the result
 * to the nearest integer using {@link Math.round}.
 * This determines the approximate center coordinates `[centerRow, centerCol]` of the map.
 *
 * Example:
 * - If `mapSize.gridSize` is `[10, 20]` (10 rows, 20 columns),
 *   `defaultPlayerPos` will be `[Math.round(10/2), Math.round(20/2)]`, resulting in `[5, 10]`.
 * - If `mapSize.gridSize` is `[7, 15]` (7 rows, 15 columns),
 *   `defaultPlayerPos` will be `[Math.round(7/2), Math.round(15/2)]`, i.e., `[Math.round(3.5), Math.round(7.5)]`, resulting in `[4, 8]`.
 *
 * Type Information:
 * - The `gridSize` property of the `mapSize` store is of type {@link GridMapShape}, which is a tuple of `[number, number]`.
 * - The operation `gridSize.map((size) => Math.round(size / 2))` applies the function to each element
 *   of `gridSize` (number of rows, number of columns), creating a new `[number, number]` array
 *   (e.g., `[calculatedCenterRow, calculatedCenterColumn]`).
 * - This resulting array matches the structure of {@link GridMapShape}, so the type assertion `as GridMapShape`
 *   is used to explicitly specify its type. This assures the TypeScript compiler that the value's structure
 *   conforms to `GridMapShape`.
 *
 * @derived_from mapSize - Depends on the `gridSize` value from the `mapSize` store and updates dynamically.
 * @returns {GridMapShape} The calculated default starting position of the player as `[row, column]`.
 */
export const defaultPlayerPos = derived(mapSize, ({ gridSize }) => {
	// gridSize is of type GridMapShape, representing [total rows, total columns] (e.g., [10, 20]).
	// The .map() operation is used to divide each dimension (rows, columns) by 2,
	// and Math.round() rounds it to the nearest integer,
	// creating a new [number, number] array for the map's center (e.g., [5, 10]).
	// This resulting array matches the structure of GridMapShape ([number, number] tuple),
	// hence the type assertion (as GridMapShape).
	return gridSize.map((size) => Math.round(size / 2)) as GridMapShape;
});
