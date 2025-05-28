/**
 * Environment configuration utilities with reactive state management
 * 반응형 상태 관리를 포함한 환경변수 설정 유틸리티
 */

import { readable } from "svelte/store";

/**
 * Enhanced boolean parsing with comprehensive validation
 * 포괄적인 유효성 검사를 포함한 향상된 boolean 파싱
 */
function parseBooleanEnv(
	value: string | undefined,
	defaultValue = false,
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
