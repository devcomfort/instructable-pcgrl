import { z } from "zod";

/**
 * Defines the schema for an action within the system.
 * An action represents a command or operation that can be triggered by a user or programmatically.
 * It includes details such as a unique key, description, keyboard event code, display key, and a visual symbol.
 * This schema is used to validate action configurations and provide type safety.
 */
export const UserActionSchema = z.object({
	/**
	 * A unique identifier for the action.
	 * This key is used programmatically to refer to the action.
	 * @example "MOVE_UP", "MOVE_DOWN", "RETRY", "WIN"
	 */
	key: z
		.string()
		.describe("The unique key for the action (e.g., 'MOVE_UP', 'MOVE_DOWN')."),
	/**
	 * A human-readable description of what the action does.
	 * This can be used for tooltips or accessibility purposes.
	 * @example "Move the character one step up."
	 */
	description: z
		.string()
		.describe("The human-readable description of the action."),
	/**
	 * The `KeyboardEvent.code` value associated with this action.
	 * This represents the physical key pressed.
	 * For actions not directly triggered by a standard physical key press (e.g., programmatic actions, win state),
	 * a conventional string like 'None' or a descriptive placeholder can be used.
	 * @example "KeyW", "KeyA", "KeyR", "None"
	 */
	eventCode: z
		.string()
		.describe(
			"The KeyboardEvent.code value for the action (e.g., 'KeyW', 'KeyA', 'KeyR', or 'None' for non-key actions).",
		),
	/**
	 * The string representation to display for this action's trigger.
	 * This is often the character produced by the key or a symbol.
	 * It's used for UI elements like button labels or help texts.
	 * @example "W", "A", "R", "🏆"
	 */
	displayKey: z
		.string()
		.describe(
			"The character or symbol to display for the action's trigger (e.g., 'W', 'A', 'R', '🏆').",
		),
	/**
	 * A visual symbol or icon representing the action, often an emoji or special character.
	 * This is primarily used in UI elements for quick visual identification and to enhance user experience.
	 * @example "⬆️" (for move up), "⬇️" (for move down), "⎌" (for retry), "🏆" (for win)
	 */
	symbol: z
		.string()
		.describe("The visual symbol for the action (e.g., '⬆️', '⬇️', '⎌', '🏆')."),
});

/**
 * Represents the TypeScript type for an action, inferred from the {@link ActionSchema}.
 * This type is used throughout the application to ensure type safety when working with action objects.
 */
export type UserAction = z.infer<typeof UserActionSchema>;
