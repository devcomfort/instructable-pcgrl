import type { ButtonTypes } from "./button-types";
import { ButtonTypesSchema } from "./button-types";
import type { ClassValue } from "svelte/elements";
import { z } from "zod";

/**
 * ClassValue 타입에 대한 Zod 스키마
 * svelte: ClassValue = string | import('clsx').ClassArray | import('clsx').ClassDictionary
 * clsx: ClassValue = ClassArray | ClassDictionary | string | number | bigint | null | boolean | undefined
 */
// 재귀적 타입 정의를 위한 지연 로직
const ClassValueSchema: z.ZodType<ClassValue> = z.lazy(() =>
	z.union([
		z.string({ invalid_type_error: "클래스명은 문자열이어야 합니다." }),
		z.array(ClassValueSchema, {
			invalid_type_error: "클래스 배열은 ClassValue의 배열이어야 합니다.",
		}),
		z.record(
			z.string(),
			z.union([z.boolean(), z.string(), z.number(), z.null(), z.undefined()]),
			{
				invalid_type_error:
					"클래스 사전은 Record<string, any> 형태여야 합니다.",
			},
		),
	]),
);

/**
 * 버튼 컴포넌트의 속성을 정의하는 Zod 스키마
 */
export const ButtonPropsSchema = z.object({
	onclick: z
		.function() // args와 returns를 명시하지 않아 함수 시그니처를 느슨하게 검증
		.optional()
		.describe("버튼 클릭 시 실행되는 이벤트 핸들러"),
	iconName: ButtonTypesSchema.optional().describe("버튼에 표시될 아이콘 타입"),
	selected: z
		.boolean({
			invalid_type_error: "'selected' 값은 boolean 타입이어야 합니다.",
		})
		.optional()
		.default(false)
		.describe("버튼의 선택 상태 여부"),
	href: z
		.string({ invalid_type_error: "'href' 값은 문자열이어야 합니다." })
		.url({
			message: "'href' 값은 유효한 URL이어야 합니다 (예: http://example.com).",
		})
		.optional()
		.describe(
			"버튼이 링크로 작동할 경우의 URL (http://, https:// 등으로 시작하는 전체 URL). 특정 사이트 내부 문서 간 이동을 위한 경로도 포함합니다.",
		),
	buttonText: z
		.string({ invalid_type_error: "'buttonText' 값은 문자열이어야 합니다." })
		.optional()
		.default("Untitled Button")
		.describe("버튼에 표시될 텍스트"),
	buttonValue: z
		.string({ invalid_type_error: "'buttonValue' 값은 문자열이어야 합니다." })
		.optional()
		.describe("버튼의 값"),
	class: ClassValueSchema.optional().describe("버튼에 적용될 CSS 클래스"),
	title: z
		.string()
		.optional()
		.describe("버튼에 대한 추가 정보를 제공하는 HTML title 속성"),
});

/**
 * 버튼 컴포넌트의 속성을 정의하는 인터페이스
 *
 * @interface ButtonProps
 * @property {(e: MouseEvent) => void} [onclick] - 버튼 클릭 시 실행되는 이벤트 핸들러
 * @property {ButtonTypes} [iconName] - 버튼에 표시될 아이콘 타입
 * @property {boolean} [selected] - 버튼의 선택 상태 여부
 * @property {string} [href] - 버튼이 링크로 작동할 경우의 URL (유효한 URL 형식이어야 함)
 * @property {string} [buttonText] - 버튼에 표시될 텍스트
 * @property {string} [buttonValue] - 버튼의 값
 * @property {ClassValue} class - 버튼에 적용될 CSS 클래스
 * @property {string} [title] - HTML title 속성
 */
export interface ButtonProps {
	onclick?: (e: MouseEvent) => void;
	iconName?: ButtonTypes;
	selected?: boolean;
	href?: string;
	buttonText?: string;
	buttonValue?: string;
	class?: ClassValue;
	title?: string;
}
