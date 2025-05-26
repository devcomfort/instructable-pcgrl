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
	instruction: z
		.string()
		.describe(
			"Instruction provided for generating this specific episode. This typically originates from user input or predefined scenarios, guiding the agent's behavior or task for this episode. \\n\\n--- \\n\\n 이 특정 에피소드를 생성하기 위해 제공된 지시사항입니다. 이는 일반적으로 사용자 입력 또는 사전 정의된 시나리오에서 비롯되며, 이 에피소드에 대한 에이전트의 행동이나 작업을 안내합니다.",
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
 * Each episode contains sequences of actions, agent positions, an instruction, and game states.
 * A top-level `response` field provides an overall message.
 * The length of the 'state' array within each episode usually matches the 'step_count' from the initial request.
 *
 * The structure is an object where:
 * - Episode keys (e.g., "0", "1", "2") map to objects conforming to {@link EpisodeDataSchema}.
 * - A `response` key maps to a string message.
 *
 * Each episode data object includes:
 * - `action`: A sequence of actions (array of array of numbers).
 * - `agent_pos`: A sequence of agent positions (array of [row, col] tuples).
 * - `instruction`: A string containing the instruction for that episode.
 * - `state`: A sequence of game level states (array of GridMap), where each GridMap is a step.
 *
 * @example
 * // Example of response data for a request with step_count = 1, generating 3 episodes:
 * const validData = {
 *   "0": { // Episode 0
 *     "action": [ [1] ],
 *     "agent_pos": [ [7,7] ],
 *     "instruction": "Minimal path length, Top-focused bat distribution.",
 *     "state": [ // One state, corresponding to step_count = 1
 *       [ [1,2,1], [2,1,2], [1,2,1] ] // State at step 0
 *     ]
 *   },
 *   "1": { // Episode 1
 *     "action": [ [2],[3] ], // Assuming multiple actions can occur for a single state for generality
 *     "agent_pos": [ [1,1],[1,2] ], // Assuming multiple positions can be logged
 *     "instruction": "Shortest distance traversal, Bat concentration at apex.",
 *     "state": [
 *       [ [10,11],[12,13] ] // State at step 0
 *     ]
 *   },
 *   "2": { // Episode 2
 *     "action": [ [5],[0] ],
 *     "agent_pos": [ [3,3],[3,4] ],
 *     "instruction": "Reduced pathway length, Concentration of bats at the summit.",
 *     "state": [
 *       [ [1,1],[1,1] ] // State at step 0
 *     ]
 *   },
 *   "response": "Here are three diverse variations based on your input." // Top-level response message
 *   // ... potentially more or fewer episodes based on server configuration
 * };
 *
 * try {
 *   const parsedResponse = ResponseFormatSchema.parse(validData);
 *   console.log("Response is valid and parsed:", parsedResponse);
 *   // Accessing data for a specific episode, e.g., episode "0":
 *   // const episodeZeroData = parsedResponse["0"];
 *   // if (episodeZeroData) {
 *   //   console.log("Instruction for episode 0:", episodeZeroData.instruction);
 *   //   console.log("Number of states in episode 0:", episodeZeroData.state.length); // Expected to be step_count
 *   // }
 *   // console.log("Overall response message:", parsedResponse.response);
 * } catch (error) {
 *   // Example of handling Zod validation error
 *   // if (error instanceof z.ZodError) {
 *   //   console.error("Validation failed:", error.format());
 *   // }
 * }
 */
export const ResponseFormatSchema = z
	.object({
		response: z
			.string()
			.describe(
				"A top-level textual response or summary message accompanying the set of episodes. This might provide context, acknowledge the request, or give an overview of the generated results. \\n\\n--- \\n\\n 에피소드 세트와 함께 제공되는 최상위 텍스트 응답 또는 요약 메시지입니다. 이는 컨텍스트를 제공하거나, 요청을 확인하거나, 생성된 결과에 대한 개요를 제공할 수 있습니다.",
			),
	})
	.catchall(EpisodeDataSchema)
	.describe(
		"A collection of simulation episodes, each identified by a string key (e.g., '0', '1'), and a top-level textual response. Each episode contains sequences of actions, agent positions, an instruction string, and game states. The `response` field provides an overall message related to the entire set of generated data. The number of states in each episode usually corresponds to the 'step_count' from the request. \\n\\n--- \\n\\n 문자열 키(예: '0', '1')로 식별되는 시뮬레이션 에피소드 모음과 최상위 텍스트 응답입니다. 각 에피소드에는 일련의 행동, 에이전트 위치, 지시 문자열 및 게임 상태가 포함됩니다. `response` 필드는 생성된 전체 데이터 세트와 관련된 전반적인 메시지를 제공합니다. 각 에피소드의 상태 수는 일반적으로 요청의 'step_count'에 해당합니다.",
	);

/**
 * Represents the type for data received from the inference server.
 * This type is inferred from the {@link ResponseFormatSchema} Zod schema.
 * It's an object where:
 * - Keys like "0", "1", etc., are episode identifiers (strings) and their values
 *   are objects containing 'action', 'agent_pos', 'instruction', and 'state' arrays for each episode.
 * - A `response` key holds a string message.
 * The server typically returns a predefined number of such episodes (e.g., 3).
 * The length of the 'state' array in each episode's data usually corresponds to the
 * 'step_count' parameter provided in the initial request.
 *
 * @example
 * const sampleResponse: ResponseFormat = {
 *   "episode_0": { // First of typically 3 episodes
 *     action: [ [[0]], [[1]] ],
 *     agent_pos: [[1,1], [1,2]],
 *     instruction: "Minimal path length, Top-focused bat distribution.",
 *     state: [ // Length of this array often matches request's step_count
 *       [ [10,11], [12,13] ], // State after step 1
 *       [ [20,21], [22,23] ]  // State after step 2 (if step_count was 2)
 *     ]
 *   },
 *   "episode_1": { // Second episode
 *     action: [ [[2]] ],
 *     agent_pos: [[5,5]],
 *     instruction: "Another instruction for episode 1.",
 *     state: [
 *       [ [1,0],[0,1] ],
 *       [ [1,1],[0,0] ]
 *      ]
 *   },
 *   "episode_2": { // Third episode
 *     action: [ [[3]] ],
 *     agent_pos: [[8,8]],
 *     instruction: "Instruction for episode 2.",
 *     state: [
 *       [ [5,5],[5,5] ],
 *       [ [6,6],[6,6] ]
 *     ]
 *   },
 *   "response": "Successfully generated 3 episodes based on the provided parameters."
 * };
 *
 * function processEpisode(episodeId: string, data: ResponseFormat[string], requestedStepCount: number) {
 *   // Note: Due to the .catchall, ResponseFormat[string] will be EpisodeData.
 *   // To access 'response', you'd use sampleResponse.response directly.
 *   if (typeof data === 'object' && data !== null && 'instruction' in data) { // Type guard for EpisodeData
 *    console.log(`Processing episode ${episodeId}:`);
 *    console.log(`Instruction: ${data.instruction}`);
 *    console.log(\`Expected states based on step_count (\${requestedStepCount}): \${data.state.length}\`);
 *    if (data.state.length > 0) {
 *      console.log("First state map:", data.state[0]);
 *    }
 *   }
 * }
 *
 * const stepCountForRequest = 2; // Example step_count
 * for (const episodeId in sampleResponse) {
 *   if (Object.prototype.hasOwnProperty.call(sampleResponse, episodeId) && episodeId !== 'response') {
 *     processEpisode(episodeId, sampleResponse[episodeId] as any, stepCountForRequest); // Cast needed due to mixed type
 *   }
 * }
 * console.log("Overall response:", sampleResponse.response);
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
 *     instruction: "Do something specific.",
 *     state: [ [ [1,2,1], [2,1,2], [1,2,1] ] ]
 *   },
 *   "response": "Generated one episode."
 * };
 *
 * const potentialResponseData2 = { // Missing 'response' field
 *   "0": {
 *     action: [ [1] ],
 *     agent_pos: [ [7,7] ],
 *     instruction: "Another task.",
 *     state: [ [ [1,2,1] ] ]
 *   }
 * };
 *
 * const potentialResponseData3 = { // 'instruction' missing in episode "0"
 *   "0": {
 *     action: [ [1] ],
 *     agent_pos: [ [7,7] ],
 *     // instruction is missing
 *     state: [ [ [1,2,1] ] ]
 *   },
 *   "response": "Episode data incomplete."
 * };
 *
 * if (isResponseFormat(potentialResponseData1)) {
 *   // Here, potentialResponseData1 is typed as ResponseFormat
 *   console.log("Data 1 is a valid ResponseFormat. Episode '0' instruction:", potentialResponseData1["0"].instruction);
 *   console.log("Overall response for Data 1:", potentialResponseData1.response);
 * } else {
 *   console.log("Data 1 is not a valid ResponseFormat.");
 * }
 *
 * if (isResponseFormat(potentialResponseData2)) {
 *   console.log("Data 2 is a valid ResponseFormat.");
 * } else {
 *   console.log("Data 2 is not a valid ResponseFormat (missing 'response' or other validation error).");
 * }
 *
 * if (isResponseFormat(potentialResponseData3)) {
 *   console.log("Data 3 is a valid ResponseFormat.");
 * } else {
 *   console.log("Data 3 is not a valid ResponseFormat (e.g., missing 'instruction' in episode).");
 * }
 */
export function isResponseFormat(value: unknown): value is ResponseFormat {
	return ResponseFormatSchema.safeParse(value).success;
}
