/**
 * Environment configuration utilities with reactive state management
 * 반응형 상태 관리를 포함한 환경변수 설정 유틸리티
 */

import { readable } from "svelte/store";
import { Tileset, type TilesetValue } from "$lib/core"; // Tileset import 추가
import { nextRandom } from "./random"; // nextRandom import 추가

/**
 * Enhanced boolean parsing with comprehensive validation
 * 포괄적인 유효성 검사를 포함한 향상된 boolean 파싱
 */
function parseBooleanEnv(
	value: string | undefined,
	defaultValue = false,
	// eslint-disable-next-line no-unused-vars - Parameter exists for console.log usage. Should not be removed as it's an actual input value.
	varName = "UNKNOWN",
): boolean {
	// console.log(`[ENV Parse] ${varName}:`, { raw: value, default: defaultValue }); // 개발 중 상세 로그

	if (!value || value === "") {
		// console.log(`[ENV Parse] ${varName}: Using default value`, defaultValue); // 개발 중 상세 로그
		return defaultValue;
	}

	const normalized = value.trim().toLowerCase();

	const truthyValues = ["true", "1", "yes", "on", "enabled"];
	const falsyValues = ["false", "0", "no", "off", "disabled"];

	if (truthyValues.includes(normalized)) {
		// console.log(`[ENV Parse] ${varName}: Parsed "${value}" -> true (truthy)`); // 개발 중 상세 로그
		return true;
	}

	if (falsyValues.includes(normalized)) {
		// console.log(`[ENV Parse] ${varName}: Parsed "${value}" -> false (falsy)`); // 개발 중 상세 로그
		return false;
	}

	const result = Boolean(normalized);
	// console.log(`[ENV Parse] ${varName}: Parsed "${value}" -> ${result} (Boolean cast)`); // 개발 중 상세 로그
	return result;
}

/**
 * Enhanced number parsing with integer and float support
 * 정수 및 부동소수점 지원을 포함한 향상된 숫자 파싱
 */
function parseNumberEnv(
	value: string | undefined,
	defaultValue: number,
	varName = "UNKNOWN",
	options: {
		allowFloat?: boolean;
		min?: number;
		max?: number;
	} = {},
): number {
	const {
		allowFloat = false,
		min = Number.NEGATIVE_INFINITY,
		max = Number.POSITIVE_INFINITY,
	} = options;

	// console.log(`[ENV Parse] ${varName}:`, { // 개발 중 상세 로그
	//     raw: value,
	//     default: defaultValue,
	//     allowFloat,
	//     range: [min, max]
	// });

	if (!value || value === "") {
		// console.log(`[ENV Parse] ${varName}: Using default value`, defaultValue); // 개발 중 상세 로그
		return defaultValue;
	}

	const trimmed = value.trim();
	let parsed: number;

	if (allowFloat) {
		parsed = Number.parseFloat(trimmed);
	} else {
		parsed = Number.parseInt(trimmed, 10);
	}

	if (Number.isNaN(parsed)) {
		console.warn(
			`[ENV Parse] ${varName}: Invalid number "${value}", using default`,
			defaultValue,
		);
		return defaultValue;
	}

	if (parsed < min || parsed > max) {
		console.warn(
			`[ENV Parse] ${varName}: Value ${parsed} out of range [${min}, ${max}], using default`,
			defaultValue,
		);
		return defaultValue;
	}

	// console.log(`[ENV Parse] ${varName}: Parsed "${value}" -> ${parsed} (${allowFloat ? 'float' : 'int'})`); // 개발 중 상세 로그
	return parsed;
}

/**
 * Enhanced string parsing with validation
 * 유효성 검사를 포함한 향상된 문자열 파싱
 */
function parseStringEnv(
	value: string | undefined,
	defaultValue: string,
	varName = "UNKNOWN",
	options: {
		required?: boolean;
		minLength?: number;
		maxLength?: number;
	} = {},
): string {
	const {
		required = false,
		minLength = 0,
		maxLength = Number.POSITIVE_INFINITY,
	} = options;

	// console.log(`[ENV Parse] ${varName}:`, { // 개발 중 상세 로그
	//     raw: value,
	//     default: defaultValue,
	//     required,
	//     lengthRange: [minLength, maxLength]
	// });

	if (!value || value === "") {
		if (required) {
			console.error(
				`[ENV Parse] ${varName}: Required environment variable is missing`,
			);
			throw new Error(`Required environment variable ${varName} is missing`);
		}
		// console.log(`[ENV Parse] ${varName}: Using default value`, defaultValue); // 개발 중 상세 로그
		return defaultValue;
	}

	const trimmed = value.trim();

	if (trimmed.length < minLength || trimmed.length > maxLength) {
		console.warn(
			`[ENV Parse] ${varName}: String length ${trimmed.length} out of range [${minLength}, ${maxLength}], using default`,
			defaultValue,
		);
		return defaultValue;
	}

	// console.log(`[ENV Parse] ${varName}: Parsed "${value}" -> "${trimmed}"`); // 개발 중 상세 로그
	return trimmed;
}

/**
 * Animation configuration type
 * 애니메이션 설정 타입
 */
export type AnimationConfig = {
	candidateAnimationMode: boolean;
	selectionAnimationMode: boolean;
	candidateAnimationInterval: number;
	selectionAnimationInterval: number;
	showAgentPosition: boolean;
};

/**
 * Load animation configuration from environment variables
 * 환경변수에서 애니메이션 설정 로드
 */
function loadAnimationConfig(): AnimationConfig {
	try {
		const candidateMode = parseBooleanEnv(
			import.meta.env.VITE_CANDIDATE_ANIMATION_MODE,
			true,
			"VITE_CANDIDATE_ANIMATION_MODE",
		);

		const selectionMode = parseBooleanEnv(
			import.meta.env.VITE_SELECTION_ANIMATION_MODE,
			true,
			"VITE_SELECTION_ANIMATION_MODE",
		);

		const candidateInterval = parseNumberEnv(
			import.meta.env.VITE_CANDIDATE_ANIMATION_INTERVAL,
			600,
			"VITE_CANDIDATE_ANIMATION_INTERVAL",
			{ min: 100, max: 5000 },
		);

		const selectionInterval = parseNumberEnv(
			import.meta.env.VITE_SELECTION_ANIMATION_INTERVAL,
			400,
			"VITE_SELECTION_ANIMATION_INTERVAL",
			{ min: 100, max: 5000 },
		);

		const showAgentPositionEnv = parseBooleanEnv(
			import.meta.env.VITE_SHOW_AGENT_POSITION,
			false,
			"VITE_SHOW_AGENT_POSITION",
		);

		const config = {
			candidateAnimationMode: candidateMode,
			selectionAnimationMode: selectionMode,
			candidateAnimationInterval: candidateInterval,
			selectionAnimationInterval: selectionInterval,
			showAgentPosition: showAgentPositionEnv,
		};

		console.log(
			"[AnimationConfig] Environment variables loaded successfully:",
			config,
		);
		return config;
	} catch (error) {
		console.error(
			"[AnimationConfig] Failed to load environment variables:",
			error,
		);
		// Return default values on error
		return {
			candidateAnimationMode: true,
			selectionAnimationMode: true,
			candidateAnimationInterval: 600,
			selectionAnimationInterval: 400,
			showAgentPosition: false,
		};
	}
}

/**
 * Reactive animation configuration store
 * 반응형 애니메이션 설정 store
 */
export const animationConfig = readable<AnimationConfig>(loadAnimationConfig());

/**
 * Log current animation configuration (for debugging)
 * 현재 애니메이션 설정 로그 출력 (디버깅용)
 */
export function logAnimationConfig() {
	console.log("=== ANIMATION CONFIGURATION ===");

	// Get current value from store
	let currentConfig: AnimationConfig | undefined;
	const unsubscribe = animationConfig.subscribe((config) => {
		currentConfig = config;
	});
	unsubscribe();

	console.log("[Animation Config] Current settings:", currentConfig);
	console.log("[Animation Config] Raw environment values:", {
		VITE_CANDIDATE_ANIMATION_MODE: import.meta.env
			.VITE_CANDIDATE_ANIMATION_MODE,
		VITE_SELECTION_ANIMATION_MODE: import.meta.env
			.VITE_SELECTION_ANIMATION_MODE,
		VITE_CANDIDATE_ANIMATION_INTERVAL: import.meta.env
			.VITE_CANDIDATE_ANIMATION_INTERVAL,
		VITE_SELECTION_ANIMATION_INTERVAL: import.meta.env
			.VITE_SELECTION_ANIMATION_INTERVAL,
		VITE_SHOW_AGENT_POSITION: import.meta.env.VITE_SHOW_AGENT_POSITION,
	});
	console.log("================================");
}

/**
 * Export utility functions for external use
 * 외부 사용을 위한 유틸리티 함수 내보내기
 */
export { parseBooleanEnv, parseNumberEnv, parseStringEnv };

/**
 * Tile generation probability configuration type
 * 타일 생성 확률 설정 타입
 */
export type TileGenerationProbabilities = {
	EMPTY: number;
	WALL: number;
	BAT: number;
};

/**
 * Default probabilities if environment variables are not set or invalid.
 * 환경 변수가 설정되지 않았거나 유효하지 않은 경우의 기본 확률.
 */
const DEFAULT_TILE_PROBABILITIES: TileGenerationProbabilities = {
	EMPTY: 0.7,
	WALL: 0.2,
	BAT: 0.1,
};

/**
 * Load tile generation probabilities from environment variables.
 * 환경변수에서 타일 생성 확률 로드.
 * Normalizes probabilities to sum to 1.
 * 확률의 합이 1이 되도록 정규화합니다.
 */
function loadTileGenerationProbabilities(): TileGenerationProbabilities {
	try {
		const probEmpty = parseNumberEnv(
			import.meta.env.VITE_PROBABILITY_FOR_EMPTY,
			DEFAULT_TILE_PROBABILITIES.EMPTY,
			"VITE_PROBABILITY_FOR_EMPTY",
			{ allowFloat: true, min: 0 },
		);
		const probWall = parseNumberEnv(
			import.meta.env.VITE_PROBABILITY_FOR_WALL,
			DEFAULT_TILE_PROBABILITIES.WALL,
			"VITE_PROBABILITY_FOR_WALL",
			{ allowFloat: true, min: 0 },
		);
		const probBat = parseNumberEnv(
			import.meta.env.VITE_PROBABILITY_FOR_BAT,
			DEFAULT_TILE_PROBABILITIES.BAT,
			"VITE_PROBABILITY_FOR_BAT",
			{ allowFloat: true, min: 0 },
		);

		const totalProb = probEmpty + probWall + probBat;

		if (totalProb <= 0) {
			// If sum is 0 or negative (e.g., all are 0), use defaults to avoid division by zero
			console.warn(
				`[TileGenerationProbabilities] Total probability is ${totalProb}. Using default probabilities.`,
				DEFAULT_TILE_PROBABILITIES,
			);
			return DEFAULT_TILE_PROBABILITIES;
		}

		const probabilities = {
			EMPTY: probEmpty / totalProb,
			WALL: probWall / totalProb,
			BAT: probBat / totalProb,
		};

		// Ensure the sum is very close to 1 after normalization
		const finalSum =
			probabilities.EMPTY + probabilities.WALL + probabilities.BAT;
		if (Math.abs(finalSum - 1) > 1e-9) {
			// Check for floating point inaccuracies
			console.warn(
				`[TileGenerationProbabilities] Normalized probabilities do not sum to 1 (sum: ${finalSum}). This might indicate an issue. Probabilities:`,
				probabilities,
			);
			// Optional: Could re-normalize or stick with it if close enough
		}

		console.log(
			"[TileGenerationProbabilities] Environment variables loaded successfully:",
			probabilities,
		);
		return probabilities;
	} catch (error) {
		console.error(
			"[TileGenerationProbabilities] Failed to load environment variables:",
			error,
		);
		// Return default values on error
		return DEFAULT_TILE_PROBABILITIES;
	}
}

/**
 * Reactive tile generation probabilities store.
 * 반응형 타일 생성 확률 스토어.
 */
export const tileGenerationProbabilities =
	readable<TileGenerationProbabilities>(loadTileGenerationProbabilities());

/**
 * Utility function to get a random tile based on configured probabilities.
 * 설정된 확률에 따라 랜덤 타일을 가져오는 유틸리티 함수.
 * @param probabilities - The probabilities for each tile type.
 * @returns A TilesetValue.
 */
export function getRandomTile(
	probabilities: TileGenerationProbabilities,
): TilesetValue {
	const rand = nextRandom(); // Math.random() 대신 nextRandom() 사용
	let cumulativeProbability = 0;

	cumulativeProbability += probabilities.EMPTY;
	if (rand < cumulativeProbability) {
		return Tileset.EMPTY;
	}
	cumulativeProbability += probabilities.WALL;
	if (rand < cumulativeProbability) {
		return Tileset.WALL;
	}
	// BAT is the last one, so it takes the remainder of the probability.
	return Tileset.BAT;
}
