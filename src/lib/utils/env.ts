/**
 * Environment configuration utilities
 * 환경변수 설정 유틸리티
 */

/**
 * Parse boolean environment variable
 * 환경변수를 boolean으로 파싱
 */
function parseBooleanEnv(value: string | undefined, defaultValue = false) {
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
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
    candidateAnimationMode: parseBooleanEnv(import.meta.env.VITE_CANDIDATE_ANIMATION_MODE, true),

    /**
     * Whether to show animation when selecting a map candidate
     * 후보 선택 시 애니메이션 표시 여부
     */
    selectionAnimationMode: parseBooleanEnv(import.meta.env.VITE_SELECTION_ANIMATION_MODE, true)
} as const;

/**
 * Log current animation configuration (for debugging)
 * 현재 애니메이션 설정 로그 출력 (디버깅용)
 */
export function logAnimationConfig() {
    console.log('[Animation Config]', {
        candidateMode: animationConfig.candidateAnimationMode,
        selectionMode: animationConfig.selectionAnimationMode,
        rawEnvValues: {
            VITE_CANDIDATE_ANIMATION_MODE: import.meta.env.VITE_CANDIDATE_ANIMATION_MODE,
            VITE_SELECTION_ANIMATION_MODE: import.meta.env.VITE_SELECTION_ANIMATION_MODE
        }
    });
} 