import { z } from "zod";

/**
 * Zod schema for validating a grid map.
 * A grid map is represented as a 2D array (array of arrays) of numbers.
 * Each number in the inner arrays corresponds to a specific tile type.
 * These tile types are typically defined in an enumeration or constant object like {@link Tileset}.
 *
 * @example
 * // A valid grid map structure that this schema would validate:
 * const validMapData = [
 *   [0, 0, 0],
 *   [0, 1, 0],
 *   [0, 0, 0]
 * ];
 * // Where 0 could represent Tileset.BORDER and 1 Tileset.EMPTY.
 *
 * @see {@link Tileset} for concrete tile type definitions.
 */
export const GridMapSchema = z.array(z.array(z.number()));

/**
 * Represents a game map or level layout in a grid format.
 * It's structured as a 2D array, where:
 * - The outer array represents the entire grid.
 * - Each inner array represents a row of tiles in the grid.
 * - Each number within an inner array represents a specific tile type (e.g., wall, empty space, item),
 *   corresponding to values defined in {@link Tileset}.
 *
 * This type is inferred from {@link GridMapSchema} to ensure that any data conforming to
 * `GridMap` also passes Zod validation, promoting data integrity and consistency.
 *
 * @example
 * const exampleMap: GridMap = [
 *   [0, 0, 0, 0, 0], // Row 0
 *   [0, 1, 2, 1, 0], // Row 1
 *   [0, 1, 1, 3, 0], // Row 2
 *   [0, 0, 0, 0, 0], // Row 3
 * ];
 * // In this example, using values from a Tileset:
 * // - 0 could be Tileset.BORDER
 * // - 1 could be Tileset.EMPTY
 * // - 2 could be Tileset.WALL
 * // - 3 could be Tileset.BAT
 * // Refer to the actual {@link Tileset} for specific definitions used in the application.
 */
export type GridMap = z.infer<typeof GridMapSchema>;
