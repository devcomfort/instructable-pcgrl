import { z } from "zod";
// eslint-disable-next-line no-unused-vars
import { GridMapSchema, type GridMap } from "../grid-map";

/**
 * === RLBrush Inference Response Format Definition ===
 *
 * This module defines the data structures and validation schemas for responses received
 * from the RLBrush API after an inference request. It uses Zod for schema definition
 * and validation to ensure that response payloads are correctly structured and can be
 * safely processed by the client.
 *
 * The response typically consists of multiple simulation "episodes". Each episode contains
 * sequences of actions, agent positions, and game states resulting from the inference process.
 *
 * Key components:
 * - `EpisodeDataSchema`: A Zod schema for the data within a single simulation episode,
 *   including `action`, `agent_pos`, and `state` sequences.
 * - `ResponseFormatSchema`: The main Zod schema for the entire API response. It defines
 *   the response as a record of episode identifiers to `EpisodeDataSchema` objects.
 * - `ResponseFormat`: The TypeScript type inferred from `ResponseFormatSchema`, providing
 *   compile-time type safety for response objects.
 * - `isResponseFormat`: A type guard function to check if an unknown value conforms to the
 *   `ResponseFormat` type.
 *
 * This module is essential for robustly handling and interpreting data returned by the
 * inference server.
 * @module
 */

/**
 * Zod schema for the data of a single simulation episode.
 * This is used as a building block for the main {@link ResponseFormatSchema}.
 */
const EpisodeDataSchema = z.object({
	action: z
		.array(z.array(z.number()))
		.describe(
			"A sequence of actions performed by the agent in one episode. Each action is represented as an array of numbers.",
		),
	agent_pos: z
		.array(z.tuple([z.number(), z.number()]))
		.describe(
			"A sequence of the agent's (row, column) positions in one episode. Each position is a two-element array, e.g., [row, col].",
		),
	state: z
		.array(GridMapSchema)
		.describe(
			"A sequence of game states (GridMaps) encountered in one episode. Each state represents a step in the simulation. The number of states typically corresponds to the 'step_count' provided in the request. See {@link GridMapSchema}.",
		),
});

/**
 * Zod schema for validating the response format received from the inference server.
 * The server typically returns a predefined number of episodes (e.g., 3) unless specified otherwise.
 * Each episode contains sequences of actions, agent positions, and game states.
 * The length of the 'state' array within each episode usually matches the 'step_count' from the initial request.
 *
 * The top-level structure is an object where each key is a string episode identifier
 * (e.g., "0", "1", "2") and the value is an object conforming to {@link EpisodeDataSchema}.
 *
 * Each episode data object includes:
 * - `action`: A sequence of actions (array of array of numbers).
 * - `agent_pos`: A sequence of agent positions (array of [row, col] tuples).
 * - `state`: A sequence of game level states (array of GridMap), where each GridMap is a step.
 *
 * @example
 * // Example of response data for a request with step_count = 2, generating 3 episodes:
 * const validData = {
 *   "0": { // Episode 0
 *     "action": [ [1],[4] ],
 *     "agent_pos": [ [7,7],[7,8] ],
 *     "state": [ // Two states, corresponding to step_count = 2
 *       [ [1,2,1], [2,1,2], [1,2,1] ], // State at step 0
 *       [ [0,1,0], [1,0,1], [0,1,0] ]  // State at step 1
 *     ]
 *   },
 *   "1": { // Episode 1
 *     "action": [ [2],[3] ],
 *     "agent_pos": [ [1,1],[1,2] ],
 *     "state": [
 *       [ [10,11],[12,13] ], // State at step 0
 *       [ [14,15],[16,17] ]  // State at step 1
 *     ]
 *   },
 *   "2": { // Episode 2
 *     // ... similar structure with 2 states ...
 *     "action": [ [5],[0] ],
 *     "agent_pos": [ [3,3],[3,4] ],
 *     "state": [
 *       [ [1,1],[1,1] ], // State at step 0
 *       [ [2,2],[2,2] ]  // State at step 1
 *     ]
 *   }
 *   // ... potentially more or fewer episodes based on server configuration
 * };
 *
 * try {
 *   const parsedResponse = ResponseFormatSchema.parse(validData);
 *   console.log("Response is valid and parsed:", parsedResponse);
 *   // Accessing data for a specific episode, e.g., episode "0":
 *   // const episodeZeroData = parsedResponse["0"];
 *   // if (episodeZeroData) {
 *   //   console.log("Number of states in episode 0:", episodeZeroData.state.length); // Expected to be step_count
 *   //   console.log("Actions for episode 0:", episodeZeroData.action);
 *   // }
 * } catch (error) {
 *   // Example of handling Zod validation error
 *   // if (error instanceof z.ZodError) {
 *   //   console.error("Validation failed:", error.format());
 *   // }
 * }
 */
export const ResponseFormatSchema = z
	.record(z.string(), EpisodeDataSchema)
	.describe(
		"A collection of simulation episodes. Typically, the server returns a fixed number of episodes (e.g., 3). Each key is an episode identifier (string), and the value contains sequences of actions, agent positions, and states. The number of states in each episode usually corresponds to the 'step_count' from the request.",
	);

/**
 * Represents the type for data received from the inference server.
 * This type is inferred from the {@link ResponseFormatSchema} Zod schema.
 * It's a record where keys are episode identifiers (strings) and values
 * are objects containing 'action', 'agent_pos', and 'state' arrays for each episode.
 * The server typically returns a predefined number of such episodes (e.g., 3).
 * The length of the 'state' array in each episode's data usually corresponds to the
 * 'step_count' parameter provided in the initial request.
 *
 * @example
 * const sampleResponse: ResponseFormat = {
 *   "episode_0": { // First of typically 3 episodes
 *     action: [ [[0]], [[1]] ],
 *     agent_pos: [[1,1], [1,2]],
 *     state: [ // Length of this array often matches request's step_count
 *       [ [10,11], [12,13] ], // State after step 1
 *       [ [20,21], [22,23] ]  // State after step 2 (if step_count was 2)
 *     ]
 *   },
 *   "episode_1": { // Second episode
 *     action: [ [[2]] ],
 *     agent_pos: [[5,5]],
 *     state: [
 *       [ [1,0],[0,1] ],
 *       [ [1,1],[0,0] ]
 *      ]
 *   },
 *   "episode_2": { // Third episode
 *     // ... similar data structure
 *     action: [ [[3]] ],
 *     agent_pos: [[8,8]],
 *     state: [
 *       [ [5,5],[5,5] ],
 *       [ [6,6],[6,6] ]
 *     ]
 *   }
 * };
 *
 * function processEpisode(episodeId: string, data: ResponseFormat[string], requestedStepCount: number) {
 *   console.log(`Processing episode ${episodeId}:`);
 *   console.log(\`Expected states based on step_count (\${requestedStepCount}): \${data.state.length}\`);
 *   if (data.state.length > 0) {
 *     console.log("First state map:", data.state[0]);
 *   }
 * }
 *
 * const stepCountForRequest = 2; // Example step_count
 * for (const episodeId in sampleResponse) {
 *   if (Object.prototype.hasOwnProperty.call(sampleResponse, episodeId)) {
 *     processEpisode(episodeId, sampleResponse[episodeId], stepCountForRequest);
 *   }
 * }
 */
export type ResponseFormat = z.infer<typeof ResponseFormatSchema>;

/**
 * Type guard function to check if a given value conforms to the {@link ResponseFormat} type.
 *
 * This function uses Zod's `safeParse` method to validate the structure and types
 * of the provided value against the {@link ResponseFormatSchema}.
 *
 * @param {unknown} value - The value to check.
 * @returns {value is ResponseFormat} Returns `true` if the value conforms to the
 *   {@link ResponseFormat} type, `false` otherwise. If `true`, TypeScript will narrow
 *   down the type of `value` to `ResponseFormat` in the scope where this function is called.
 *
 * @example
 * const potentialResponseData1 = {
 *   "0": {
 *     action: [ [1] ],
 *     agent_pos: [ [7,7] ],
 *     state: [ [ [1,2,1], [2,1,2], [1,2,1] ] ]
 *   }
 * };
 *
 * const potentialResponseData2 = {
 *   "0": {
 *     actions: [ [1] ], // Incorrect property name: actions instead of action
 *     agent_positions: [ [7,7] ], // Incorrect property name
 *     states: [ [ [1,2,1] ] ] // Incorrect property name
 *   }
 * };
 *
 * if (isResponseFormat(potentialResponseData1)) {
 *   // Here, potentialResponseData1 is typed as ResponseFormat
 *   console.log("Data 1 is a valid ResponseFormat. Episode '0' action:", potentialResponseData1["0"].action);
 * } else {
 *   console.log("Data 1 is not a valid ResponseFormat.");
 * }
 *
 * if (isResponseFormat(potentialResponseData2)) {
 *   console.log("Data 2 is a valid ResponseFormat.");
 * } else {
 *   // Here, potentialResponseData2 is still of type unknown or its original type
 *   console.log("Data 2 is not a valid ResponseFormat.");
 * }
 */
export function isResponseFormat(value: unknown): value is ResponseFormat {
	return ResponseFormatSchema.safeParse(value).success;
}
