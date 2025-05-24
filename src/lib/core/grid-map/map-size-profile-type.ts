import { z } from "zod";
// eslint-disable-next-line no-unused-vars -- GridMapShape is used for JSDoc type linking
import { GridMapShapeSchema, type GridMapShape } from "./map-shape-type";

/**
 * Zod schema for the map size profile.
 * Defines `gridSize` (dimensions in grid units) and `pixelSize` (dimensions in pixels for display).
 */
export const MapSizeProfileSchema = z.object({
	/** Number of rows and columns for the grid map. */
	gridSize: GridMapShapeSchema.describe(
		"Number of rows and columns for the grid.",
	),
	/** Display height and width of the map in pixels. */
	pixelSize: GridMapShapeSchema.describe(
		"Height and width in pixels for display.",
	),
});

/**
 * Type for the map size profile. Inferred from {@link MapSizeProfileSchema}.
 *
 * @property gridSize - Grid dimensions as `[rows, columns]`. See {@link GridMapShape}.
 * @property pixelSize - Display dimensions in pixels as `[height, width]`. See {@link GridMapShape}.
 * @example
 * const profile: MapSizeProfile = {
 *   gridSize: [10, 15],    // 10 rows, 15 columns
 *   pixelSize: [500, 750]  // 500px height, 750px width
 * };
 */
export type MapSizeProfile = z.infer<typeof MapSizeProfileSchema>;
