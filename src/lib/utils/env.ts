/**
 * Environment configuration utilities
 * 환경변수 설정 유틸리티
 */

/**
 * Parse boolean environment variable with detailed logging
 * 상세한 로깅과 함께 환경변수를 boolean으로 파싱
 */
function parseBooleanEnv(value: string | undefined, defaultValue = false, varName = 'UNKNOWN') {
    console.log(`[ENV Parse] ${varName}:`, { raw: value, default: defaultValue });

    if (!value || value === '') {
        console.log(`[ENV Parse] ${varName}: Using default value`, defaultValue);
        return defaultValue;
    }

    const normalized = value.trim().toLowerCase();
    const result = normalized === 'true';

    console.log(`[ENV Parse] ${varName}: Parsed "${value}" -> ${result}`);
    return result;
}

/**
 * Parse number environment variable with validation
 * 유효성 검사와 함께 환경변수를 number로 파싱
 */
function parseNumberEnv(value: string | undefined, defaultValue: number, varName = 'UNKNOWN') {
    console.log(`[ENV Parse] ${varName}:`, { raw: value, default: defaultValue });

    if (!value || value === '') {
        console.log(`[ENV Parse] ${varName}: Using default value`, defaultValue);
        return defaultValue;
    }

    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
        console.warn(`[ENV Parse] ${varName}: Invalid value "${value}", using default`, defaultValue);
        return defaultValue;
    }

    console.log(`[ENV Parse] ${varName}: Parsed "${value}" -> ${parsed}`);
    return parsed;
}

/**
 * Animation mode configuration
 * 애니메이션 모드 설정
 */
export const animationConfig = {
    /**
     * Whether to show animation in map candidates list
     * 후보군에서 애니메이션 표시 여부
     */
    candidateAnimationMode: parseBooleanEnv(
        import.meta.env.VITE_CANDIDATE_ANIMATION_MODE,
        true,
        'VITE_CANDIDATE_ANIMATION_MODE'
    ),

    /**
     * Whether to show animation when selecting a map candidate
     * 후보 선택 시 애니메이션 표시 여부
     */
    selectionAnimationMode: parseBooleanEnv(
        import.meta.env.VITE_SELECTION_ANIMATION_MODE,
        true,
        'VITE_SELECTION_ANIMATION_MODE'
    ),

    /**
     * Animation interval for map candidates in milliseconds
     * 후보군 애니메이션 간격 (밀리초)
     */
    candidateAnimationInterval: parseNumberEnv(
        import.meta.env.VITE_CANDIDATE_ANIMATION_INTERVAL,
        600,
        'VITE_CANDIDATE_ANIMATION_INTERVAL'
    ),

    /**
     * Animation interval for selection animation in milliseconds
     * 선택 애니메이션 간격 (밀리초)
     */
    selectionAnimationInterval: parseNumberEnv(
        import.meta.env.VITE_SELECTION_ANIMATION_INTERVAL,
        400,
        'VITE_SELECTION_ANIMATION_INTERVAL'
    )
} as const;

/**
 * Log current animation configuration (for debugging)
 * 현재 애니메이션 설정 로그 출력 (디버깅용)
 */
export function logAnimationConfig() {
    console.log('=== ANIMATION CONFIGURATION ===');
    console.log('[Animation Config] Current settings:', {
        candidateMode: animationConfig.candidateAnimationMode,
        selectionMode: animationConfig.selectionAnimationMode,
        candidateInterval: animationConfig.candidateAnimationInterval,
        selectionInterval: animationConfig.selectionAnimationInterval
    });
    console.log('[Animation Config] Raw environment values:', {
        VITE_CANDIDATE_ANIMATION_MODE: import.meta.env.VITE_CANDIDATE_ANIMATION_MODE,
        VITE_SELECTION_ANIMATION_MODE: import.meta.env.VITE_SELECTION_ANIMATION_MODE,
        VITE_CANDIDATE_ANIMATION_INTERVAL: import.meta.env.VITE_CANDIDATE_ANIMATION_INTERVAL,
        VITE_SELECTION_ANIMATION_INTERVAL: import.meta.env.VITE_SELECTION_ANIMATION_INTERVAL
    });
    console.log('================================');
} 