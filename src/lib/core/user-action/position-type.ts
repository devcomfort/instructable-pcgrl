import { z } from "zod";

/**
 * Zod schema for validating UV coordinates.
 * UV coordinates are used here to represent positions within a 2D space,
 * where 'u' typically corresponds to the horizontal axis and 'v' to the vertical axis.
 * Both coordinates are defined as positive integers.
 */
export const PositionSchema = z.object({
	/** The u-coordinate (horizontal axis), must be a positive integer. */
	u: z
		.number()
		.int()
		.positive()
		.describe("The u-coordinate (horizontal axis), a positive integer."),
	/** The v-coordinate (vertical axis), must be a positive integer. */
	v: z
		.number()
		.int()
		.positive()
		.describe("The v-coordinate (vertical axis), a positive integer."),
});

/**
 * Type representing a position using UV coordinates.
 * - `u`: The horizontal coordinate.
 * - `v`: The vertical coordinate.
 *
 * This type is inferred from the {@link PositionSchema} Zod schema,
 * ensuring that 'u' and 'v' are positive integers.
 *
 * @example
 * const point: Position = { u: 10, v: 20 };
 */
export type Position = z.infer<typeof PositionSchema>;
