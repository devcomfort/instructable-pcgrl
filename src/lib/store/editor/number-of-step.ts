import { DEFAULT_NUM_STEPS } from "$lib/core/defaults";
import { writable } from "svelte/store";

/**
 * A Svelte store representing the "number of steps" or "degree of change"
 * the AI model should perform when generating suggestions.
 *
 * This value controls how many iterative changes the AI will make in a single suggestion.
 * - A smaller value (e.g., 1) tends to make the AI suggest minimal or single-step changes
 *   from the current state.
 * - A larger value allows the AI to suggest more significant transformations that might
 *   occur over multiple conceptual steps.
 *
 * This value is typically adjustable by the user through the UI (e.g., a `Toolbar` component)
 * and is sent to the inference server as a parameter (often called `step_count`).
 * The server then uses this value to determine the length of the `action` and `state`
 * sequences in each episode of the response. For example, if `numberOfStep` is `N`,
 * the `state` array in each episode of the server's response (as defined in
 * `src/lib/core/inference/response-format.ts`, see `EpisodeDataSchema`) will
 * typically contain `N` game states.
 *
 * It is used in functions like `generateModelSuggestions` in the `TensorFlowService`
 * to influence the AI model's suggestion generation process.
 */
export const numberOfStep = writable(DEFAULT_NUM_STEPS);
