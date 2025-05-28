import { z } from "zod";

/**
 * ButtonTypesSchema 정의:
 * - Button 컴포넌트에서 사용 가능한 아이콘 타입을 정의하는 Zod enum 스키마입니다.
 * - 각 아이콘 타입은 ButtonProps의 iconName 프로퍼티에 사용됩니다.
 * - 사용 가능한 아이콘 타입 목록:
 *   - "pencil": 연필 아이콘
 *   - "eyedropper": 색상 선택기 아이콘
 *   - "droplet": 물방울 아이콘
 *   - "paint-format": 페인트 포맷 아이콘
 *   - "bin": 쓰레기통 아이콘
 *   - "erase": 지우개 아이콘
 *   - "play": 재생 아이콘
 *   - "share": 공유 아이콘
 *   - "feedback": 피드백 아이콘
 *   - "random": 랜덤 아이콘
 */
export const ButtonTypesSchema = z.enum([
	"pencil",
	"eyedropper",
	"droplet",
	"paint-format",
	"bin",
	"erase",
	"play",
	"share",
	"feedback",
	"random",
]);

/**
 * ButtonTypes 타입 정의:
 * - ButtonTypesSchema에서 추론된 타입을 사용하여 ButtonProps의 iconName 프로퍼티 타입을 정의합니다.
 * - 이 타입은 Button 컴포넌트에서 사용 가능한 아이콘 타입을 제한하는 데 사용됩니다.
 */
export type ButtonTypes = z.infer<typeof ButtonTypesSchema>;
