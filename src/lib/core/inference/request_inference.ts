import { assert } from "@toss/assert";
import ky from "ky";
import type { RequestFormat } from "./request-format";
import { ResponseFormatSchema, type ResponseFormat } from "./response-format";
import { z } from "zod";
/**
 * === RLBrush API Inference Request Client ===
 *
 * This module provides a function to send inference requests to the RLBrush API.
 * It leverages the `ky` library for robust HTTP requests, including features like
 * automatic JSON handling, HTTP error exceptions, and a configurable retry mechanism.
 * The module also uses Zod schemas defined in `request-format.ts` and `response-format.ts`
 * for validating request payloads and API responses.
 *
 * Key components:
 * - `requestInference`: An asynchronous function that takes a `RequestFormat` object,
 *   sends it to the RLBrush API, and returns a validated `ResponseFormat` object.
 *   It incorporates retry logic for transient errors and validates the response structure.
 * - `validateResponseData`: A helper function (internal to this module) that uses
 *   `ResponseFormatSchema` to validate the raw JSON response from the API. If validation
 *   fails, it throws an `AssertionError` with detailed information about the issues.
 *
 * This client is designed to be a reliable way to interact with the inference endpoint,
 * providing type safety and structured error handling.
 * @module
 */

/**
 * Validates the parsed JSON data against the ResponseFormatSchema.
 * If validation fails, it constructs a detailed error message from Zod issues and throws an assertion error.
 * This function effectively "gets error log data" by formatting Zod's validation errors.
 * @param responseDataJson The unknown data parsed from the JSON response.
 * @returns The validated data conforming to ResponseFormat.
 * @throws {Error} (AssertionError from @toss/assert) if Zod schema validation fails.
 */
function validateResponseData(responseDataJson: unknown): ResponseFormat {
	const parseResult = ResponseFormatSchema.safeParse(responseDataJson);

	if (!parseResult.success) {
		// ZodError is guaranteed to exist if success is false
		const zodError = parseResult.error;
		const issues = zodError.errors
			.map((err) => `Path: ${err.path.join(".")} - Message: ${err.message}`)
			.join("; \n");
		const errorMessage = `API response validation failed. Issues: \n${issues}`;
		assert(false, errorMessage); // This will always throw
	}
	// If parseResult.success is true, parseResult.data is the validated data.
	return parseResult.data;
}

/**
 * Asynchronously sends an inference request to the RLBrush API endpoint using the `ky` library.
 *
 * This function serializes the provided `request` payload and sends it as a POST request.
 * It includes a retry mechanism for transient server errors and specific HTTP status codes.
 * The server's JSON response is then parsed and validated against the `ResponseFormatSchema`.
 *
 * @async
 * @param {RequestFormat} request - The inference request payload, conforming to {@link RequestFormat}.
 * @returns {Promise<ResponseFormat>} A promise resolving to the validated server response, conforming to {@link ResponseFormat}.
 * @throws {Error} Throws an error under various failure conditions:
 *   - `HTTPError` (from `ky`): If the server responds with an HTTP error status (e.g., 4xx, 5xx) after exhausting retries.
 *     The error object contains the original `response`.
 *   - `Error` (from `ky`): For network errors or other issues during the request before an HTTP response is received (after retries).
 *   - `Error` (AssertionError from `validateResponseData`): If the parsed JSON response does not conform to {@link ResponseFormatSchema}.
 *   - `Error`: For other unexpected errors during the process.
 *
 * @example
 * async function performKyInference() {
 *   const requestPayload: RequestFormat = {
 *     current_level: [
 *       [1, 1, 1, 1],
 *       [1, 0, 0, 1],
 *       [1, 0, 0, 1],
 *       [1, 1, 1, 1]
 *     ],
 *     step_count: 10,
 *     instruction: "Create a longer horizontal corridor."
 *   };
 *
 *   try {
 *     console.log("Sending inference request with ky...");
 *     const response = await requestInference(requestPayload);
 *     console.log("Ky inference successful! Received episodes:", Object.keys(response));
 *     const firstEpisodeKey = Object.keys(response)[0];
 *     if (firstEpisodeKey) {
 *       console.log("Data for episode", firstEpisodeKey, ":", response[firstEpisodeKey]);
 *     }
 *   } catch (error) {
 *     if (error instanceof HTTPError) {
 *       console.error(
 *         `Ky HTTP Error: ${error.response.status} - ${error.message}`,
 *         await error.response.text().catch(() => "Failed to read error body")
 *       );
 *     } else {
 *       console.error("Ky inference request failed:", (error as Error).message);
 *     }
 *   }
 * }
 *
 * performKyInference();
 */
export async function requestInference(
	request: RequestFormat,
): Promise<ResponseFormat> {
	const baseApiUrl = import.meta.env.VITE_API_BASE;
	// Validate that the VITE_API_BASE environment variable is a valid URL using Zod.
	const isUrl = z.string().url().safeParse(baseApiUrl);
	assert(
		isUrl.success,
		"VITE_API_BASE environment variable is not a valid URL. Please check your .env file.",
	);

	// URL 객체를 사용하여 안전하게 URL 결합
	const apiUrl = new URL("action", baseApiUrl).toString();

	// TODO: retry, timeout, backoffLimit, delay 등의 옵션을 빠르게 설정할 수 있도록
	//       config 모듈을 만들고 설정 모아두기.
	try {
		// ky handles JSON stringification for `json` option and sets Content-Type.
		// It also parses the JSON response with `.json<unknown>()`.
		// HTTP errors (non-2xx) are automatically thrown as HTTPError.
		const responseDataJson = await ky
			.post(apiUrl, {
				json: request,
				retry: {
					limit: 3, // Max 3 retries
					methods: ["post"], // Retry on POST requests
					statusCodes: [408, 429, 500, 502, 503, 504], // Retry on specific HTTP status codes
					backoffLimit: 5000, // Maximum delay between retries (5 seconds)
					delay: (attemptCount) => 0.3 * 2 ** (attemptCount - 1) * 1000, // Exponential backoff (e.g., 300ms, 600ms, 1200ms)
				},
				timeout: 15000, // 15-second request timeout
			})
			.json<unknown>();

		// Validates the data; throws AssertionError if invalid.
		const validatedData = validateResponseData(responseDataJson);
		return validatedData;
	} catch (error: unknown) {
		// Errors can be HTTPError from ky, AssertionError from validateResponseData, or other network/unexpected errors.
		// All these are instances of Error.
		if (error instanceof Error) {
			throw error; // Re-throw to preserve original error type (HTTPError, AssertionError) and stack trace.
		}
		// For very rare cases where the caught error is not an Error instance.
		throw new Error(
			"An unknown error occurred during the inference request process.",
		);
	}
}
