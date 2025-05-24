// vitest globals (describe, it, expect, beforeEach) are typically available without explicit import
import { describe, it, expect, beforeEach } from "vitest"; // 이 줄을 주석 처리하거나 삭제
import ky, { HTTPError } from "ky";
import { requestInference } from "./request_inference";
import type { RequestFormat } from "./request-format";
import type { ResponseFormat } from "./response-format";
import { ResponseFormatSchema } from "./response-format";
import { Tileset } from "../grid-map";

/** Helper function to create a 2D map of a given size, filled with a specified tile value. */
const createMap = (size: number, fillValue: number = Tileset.EMPTY): number[][] => {
    return Array(size).fill(null).map(() => Array(size).fill(fillValue));
};

/** Helper function to create agent starting positions. Currently returns fixed positions. */
const createAgentPos = (): Array<[number, number]> => {
    return [[0, 0], [0, 1]];
}

const baseApiUrl = "https://rlbrush-api.inchang.dev/action"; // 기본 API URL

/** Type guard to check if an error is an HTTPError with a response status. */
function isHttpErrorWithResponseStatus(error: unknown): error is HTTPError & { response: { status: number } } {
    if (error instanceof HTTPError && error.response && typeof error.response.status === 'number') {
        return true;
    }
    return false;
}

/**
 * Integration tests for the requestInference function.
 * These tests make actual API calls to the RLBrush API endpoint.
 * Ensure the API server (https://rlbrush-api.inchang.dev/action) is running and accessible.
 */
describe("requestInference (Integration Tests)", () => {
    beforeEach(() => {
        // No setup needed before each test for these integration tests.
    });

    it("should return validated data for a successful API call with a 16x16 map", async () => {
        const mapSize = 16;
        const mockRequest: RequestFormat = {
            current_level: createMap(mapSize, Tileset.WALL),
            step_count: 5,
            instruction: "Test instruction for 16x16 map (supported size)",
        };

        // This placeholder is used to validate the ResponseFormatSchema definition itself,
        // ensuring it aligns with an expected valid structure for a 16x16 map response.
        const placeholderValidResponseStructure: ResponseFormat = {
            episode_0: {
                state: [createMap(mapSize, Tileset.EMPTY), createMap(mapSize, Tileset.BAT)],
                action: createMap(mapSize, Tileset.EMPTY),
                agent_pos: createAgentPos(),
            },
        };
        const schemaCheck = ResponseFormatSchema.safeParse(placeholderValidResponseStructure);
        expect(schemaCheck.success,
            `The 16x16 placeholderValidResponseStructure is invalid according to schema: ${JSON.stringify(schemaCheck.error?.format(), null, 2)}`
        ).toBe(true);

        // If requestInference throws an error, the test will automatically fail.
        const result = await requestInference(mockRequest);

        expect(result).toBeDefined();
        const validation = ResponseFormatSchema.safeParse(result);
        expect(validation.success,
            `API response validation failed for 16x16 map: ${JSON.stringify(validation.error?.format(), null, 2)}`
        ).toBe(true);

        if (validation.success) {
            const firstEpisodeKey = Object.keys(validation.data)[0];
            expect(firstEpisodeKey).toBeDefined();
            if (firstEpisodeKey) {
                const episodeData = validation.data[firstEpisodeKey];
                expect(episodeData?.state).toBeDefined();
                expect(episodeData?.action).toBeDefined();
            }
        }
    }, 60000); // Timeout set to 1 minute due to potentially long AI inference times.

    it("should receive HTTP 400 Bad Request for a 14x14 map (unsupported size)", async () => {
        const mapSize = 14;
        const mockRequest: RequestFormat = {
            current_level: createMap(mapSize, Tileset.EMPTY),
            step_count: 3,
            instruction: "Test instruction for 14x14 map (expecting 400 error)",
        };

        try {
            await requestInference(mockRequest);
            throw new Error("API did not return an error for 14x14 map as expected (expected 400 Bad Request).");
        } catch (error) {
            expect(error).toBeInstanceOf(HTTPError);
            if (isHttpErrorWithResponseStatus(error)) {
                expect(error.response.status).toBe(400);
            } else {
                throw new Error("Error for 14x14 map was not an HTTPError with a response status or status was not a number.");
            }
        }
    }, 60000);

    /**
     * The following tests for 404 and network errors use direct `ky.post` calls.
     * This is because `requestInference` internally uses a hardcoded API URL.
     * To test `requestInference`'s error re-throwing for different URLs/network conditions directly,
     * `requestInference` would need to accept the URL as a parameter or use a configurable base URL.
     * These tests verify that if `ky` throws these errors, `requestInference` would also throw them (as it re-throws errors from `ky`).
     */
    it("should re-throw HTTPError from ky when API returns an error status (e.g., 404 by hitting a wrong path)", async () => {
        const mockRequest: RequestFormat = {
            current_level: createMap(10, Tileset.EMPTY),
            step_count: 1,
            instruction: "Request to a non-existent API path",
        };
        const testUrl = `${baseApiUrl}/nonexistentpath`;

        try {
            await ky.post(testUrl, { json: mockRequest, timeout: 5000 });
            throw new Error("ky.post did not throw HTTPError for a non-existent path as expected.");
        } catch (error) {
            expect(error).toBeInstanceOf(HTTPError);
            if (isHttpErrorWithResponseStatus(error)) {
                expect(error.response.status).toBe(404);
            } else {
                throw new Error("Error for non-existent path was not an HTTPError with a response status or status was not a number.");
            }
        }
    }, 10000);

    it("should re-throw network errors from ky (e.g., connection refused)", async () => {
        const mockRequest: RequestFormat = {
            current_level: createMap(10, Tileset.EMPTY),
            step_count: 1,
            instruction: "Request to a non-listening server/port",
        };
        const nonExistentServerUrl = "http://localhost:12345/nonexistent";

        try {
            await ky.post(nonExistentServerUrl, { json: mockRequest, retry: 0, timeout: 2000 });
            throw new Error("ky.post did not throw a network error for a non-listening server as expected.");
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    }, 5000);
}); 