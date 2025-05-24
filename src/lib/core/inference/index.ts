/**
 * === RLBrush Core Inference Module ===
 *
 * This module serves as the central public interface for the inference-related
 * functionalities within the RLBrush core library. It re-exports essential
 * schemas, types, and functions from other specialized inference modules.
 *
 * Purpose:
 * - To provide a single, convenient entry point for accessing inference capabilities.
 * - To abstract the internal structure of the `inference` directory from consumers
 *   of the library.
 *
 * Re-exported modules:
 * - `requestInference`: Function to make API calls to the inference server.
 *   (from `./request_inference`)
 * - `RequestFormatSchema`, `RequestFormat`, `isRequestFormat`: For defining,
 *   typing, and validating inference request payloads. (from `./request-format`)
 * - `ResponseFormatSchema`, `ResponseFormat`, `isResponseFormat`: For defining,
 *   typing, and validating inference response payloads. (from `./response-format`)
 *
 * Consumers of the RLBrush core library should typically import inference-related
 * entities from this file rather than directly from the individual sub-modules.
 * @module
 */
export { requestInference } from "./request_inference";

export {
	RequestFormatSchema,
	type RequestFormat,
	isRequestFormat,
} from "./request-format";
export {
	ResponseFormatSchema,
	type ResponseFormat,
	isResponseFormat,
} from "./response-format";
