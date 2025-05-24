import { z } from "zod";

/**
 * Zod schema defining the shape (dimensions) of a grid map.
 * The first element of the tuple represents the number of rows (height),
 * and the second element represents the number of columns (width).
 *
 * @example
 * // A map with 5 rows and 10 columns (height 5, width 10)
 * const shape = [5, 10];
 */
export const GridMapShapeSchema = z
	.tuple([
		z
			.number()
			.int()
			.positive()
			.describe("Number of rows in the grid map (height)"),
		z
			.number()
			.int()
			.positive()
			.describe("Number of columns in the grid map (width)"),
	])
	.describe(
		"A tuple representing the dimensions of the grid map. The first element specifies the number of rows (height), and the second specifies the number of columns (width).",
	);

/**
 * Type representing the shape (dimensions) of a grid map.
 * It's a tuple of two numbers: `[number of rows, number of columns]`,
 * which can also be interpreted as `[height, width]`.
 * This type is inferred from the {@link GridMapShapeSchema} Zod schema.
 *
 * @example
 * const mapDimensions: GridMapShape = [10, 20]; // Represents a map with 10 rows and 20 columns (height 10, width 20).
 */
export type GridMapShape = z.infer<typeof GridMapShapeSchema>;
