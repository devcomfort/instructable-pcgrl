import { GridMapSchema, type GridMap } from "$lib/core/grid-map";

/**
 * Type guard function to check if the provided data conforms to the {@link GridMap} type specification.
 * It uses {@link GridMapSchema} to validate the data's integrity.
 *
 * @param data - The data to be validated. Its type is `unknown`, meaning it can accept values of any type.
 * @returns Returns `true` if the data's structure matches the {@link GridMap} type; otherwise, returns `false`.
 *          If `true` is returned, the TypeScript compiler will infer the type of `data` as {@link GridMap} within the current scope.
 * @see {@link GridMap} - The target grid map type definition.
 * @see {@link GridMapSchema} - The Zod schema used for validation.
 *
 * @example
 * const potentialGrid1 = [[0, 1], [1, 0]];
 * if (isGridMap(potentialGrid1)) {
 *   // Within this block, potentialGrid1 is treated as the GridMap type.
 *   console.log("This data is a valid grid map!");
 *   // e.g., potentialGrid1.forEach(row => console.log(row));
 * }
 *
 * const potentialGrid2 = "This is not a grid map.";
 * if (!isGridMap(potentialGrid2)) {
 *   console.log("This data is not a grid map.");
 * }
 *
 * const potentialGrid3 = [[0, "1"], [1, 0]]; // Contains a non-numeric element type
 * if (!isGridMap(potentialGrid3)) {
 *   console.log("Not a valid grid map because it contains non-numeric elements.");
 * }
 */
export function isGridMap(data: unknown): data is GridMap {
	return GridMapSchema.safeParse(data).success;
}
