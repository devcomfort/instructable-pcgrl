import { z } from "zod";
// eslint-disable-next-line no-unused-vars
import { GridMapSchema, type GridMap } from "../grid-map";

/**
 * === RLBrush Inference Request Format Definition ===
 *
 * This module defines the data structures and validation schemas for inference requests
 * sent to the RLBrush API. It utilizes Zod for schema definition and validation,
 * ensuring that request payloads are correctly structured before being processed by the server.
 *
 * Key components:
 * - `RequestFormatSchema`: A Zod schema detailing the expected format of an inference request.
 *   This includes the current game level (`current_level`), the number of generative steps
 *   (`step_count`), and a natural language instruction (`instruction`).
 * - `RequestFormat`: The TypeScript type inferred from `RequestFormatSchema`, providing
 *   compile-time type safety for request objects.
 * - `isRequestFormat`: A type guard function to check if an unknown value conforms to the
 *   `RequestFormat` type.
 *
 * This module is crucial for maintaining a clear contract between the client sending
 * inference requests and the server processing them.
 * @module
 */

/**
 * Zod schema for validating the request format sent to the inference server.
 * This schema defines the expected structure and types of the data required
 * for the model to process a level generation or modification request.
 *
 * @property {GridMap} current_level - The current state of the game level, represented as a 2D array of numbers (tile IDs).
 *                                     Each inner array constitutes a row. See {@link GridMapSchema} for detailed structure
 *                                     and {@link GridMap} for the corresponding type.
 * @property {number} step_count - The number of generative steps the model should perform.
 *                                 This must be an integer greater than or equal to 1.
 * @property {string} instruction - A natural language instruction guiding the generation or modification process
 *                                  (e.g., 'make the path longer', 'add more enemies').
 *
 * @example
 * // Example of valid request data:
 * const validData = {
 *   current_level: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], // Assuming 0 is wall, 1 is empty
 *   step_count: 5,
 *   instruction: "create a larger open area"
 * };
 *
 * try {
 *   const parsedData = RequestFormatSchema.parse(validData);
 *   console.log("Data is valid:", parsedData);
 * } catch (error) {
 *   // Example of handling Zod validation error
 *   // if (error instanceof z.ZodError) {
 *   //   console.error("Validation failed:", error.format());
 *   // }
 * }
 */
export const RequestFormatSchema = z.object({
	current_level: GridMapSchema.describe(
		"The current state of the game level, represented as a 2D array of numbers (tile IDs). See {@link GridMapSchema}.",
	),
	step_count: z
		.number()
		.int()
		.min(1)
		.describe(
			"The number of generative steps the model should perform. Must be a positive integer (>= 1).",
		),
	instruction: z
		.string()
		.describe(
			"A natural language instruction guiding the generation or modification process (e.g., 'make the path longer', 'add obstacles').",
		),
});

/**
 * Represents the type for data sent to the inference server for level generation or modification.
 * This type is inferred from the {@link RequestFormatSchema} Zod schema, ensuring that
 * request payloads conform to the expected structure and data types. It provides
 * type safety and improves developer experience when working with inference requests.
 *
 * @property {GridMap} current_level - The current state of the game level. This is a 2D array
 *                                     where each number represents a tile ID. See {@link GridMap}.
 * @property {number} step_count - The number of generative steps the model should execute.
 *                                 It must be a positive integer.
 * @property {string} instruction - A natural language instruction for the model to follow.
 *
 * @example
 * const sampleRequest: RequestFormat = {
 *   current_level: [
 *     [0, 0, 0, 0, 0], // Example: 0 could represent a border tile
 *     [0, 1, 2, 1, 0], // Example: 1 could be an empty tile, 2 a wall tile
 *     [0, 1, 1, 3, 0], // Example: 3 could be an enemy tile (e.g., a bat)
 *     [0, 0, 0, 0, 0]
 *   ],
 *   step_count: 3,
 *   instruction: "make the central path wider and add a bat"
 * };
 *
 * function sendInferenceRequest(request: RequestFormat) {
 *   // Logic to process and send the inference request
 *   console.log("Processing inference for level:", request.current_level);
 *   console.log("Number of steps:", request.step_count);
 *   console.log("Instruction:", request.instruction);
 *   // ... send to server or model
 * }
 *
 * sendInferenceRequest(sampleRequest);
 */
export type RequestFormat = z.infer<typeof RequestFormatSchema>;

/**
 * Type guard function to check if a given value conforms to the {@link RequestFormat} type.
 *
 * This function uses Zod's `safeParse` method to validate the structure and types
 * of the provided value against the {@link RequestFormatSchema}.
 *
 * @param {unknown} value - The value to check.
 * @returns {value is RequestFormat} Returns `true` if the value conforms to the
 *   {@link RequestFormat} type, `false` otherwise. If `true`, TypeScript will narrow
 *   down the type of `value` to `RequestFormat` in the scope where this function is called.
 *
 * @example
 * const potentialRequestData1 = {
 *   current_level: [[0,1],[1,0]],
 *   step_count: 1,
 *   instruction: "test"
 * };
 *
 * const potentialRequestData2 = {
 *   level: [[0,1],[1,0]], // Incorrect property name
 *   steps: 1
 * };
 *
 * if (isRequestFormat(potentialRequestData1)) {
 *   // Here, potentialRequestData1 is typed as RequestFormat
 *   console.log("Data 1 is a valid RequestFormat:", potentialRequestData1.instruction);
 * } else {
 *   console.log("Data 1 is not a valid RequestFormat.");
 * }
 *
 * if (isRequestFormat(potentialRequestData2)) {
 *   console.log("Data 2 is a valid RequestFormat.");
 * } else {
 *   // Here, potentialRequestData2 is still of type unknown or its original type
 *   console.log("Data 2 is not a valid RequestFormat.");
 * }
 */
export function isRequestFormat(value: unknown): value is RequestFormat {
	return RequestFormatSchema.safeParse(value).success;
}
