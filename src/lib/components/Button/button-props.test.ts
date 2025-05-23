import { describe, it, expect } from "vitest";
import { ButtonPropsSchema } from "./button-props";

describe("ButtonPropsSchema", () => {
	const baseValidProps = {
		class: "test-class",
	};

	it("should validate with minimal valid props", () => {
		const result = ButtonPropsSchema.safeParse(baseValidProps);
		expect(result.success).toBe(true);
	});

	it("should validate with all valid props", () => {
		const result = ButtonPropsSchema.safeParse({
			...baseValidProps,
			onClick: () => { },
			iconName: "pencil",
			selected: true,
			href: "http://example.com",
			buttonText: "Click Me",
			buttonValue: "value123",
		});
		expect(result.success).toBe(true);
	});

	describe("href validation", () => {
		it("should fail with invalid URL for href", () => {
			const result = ButtonPropsSchema.safeParse({
				...baseValidProps,
				href: "invalid-url",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.format().href?._errors[0]).toContain(
					"'href' 값은 유효한 URL이어야 합니다",
				);
			}
		});

		it("should fail if href is not a string", () => {
			const result = ButtonPropsSchema.safeParse({
				...baseValidProps,
				href: 123,
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.format().href?._errors[0]).toContain(
					"'href' 값은 문자열이어야 합니다.",
				);
			}
		});
	});

	describe("selected validation", () => {
		it("should fail if selected is not a boolean", () => {
			const result = ButtonPropsSchema.safeParse({
				...baseValidProps,
				selected: "true",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.format().selected?._errors[0]).toContain(
					"'selected' 값은 boolean 타입이어야 합니다.",
				);
			}
		});
	});

	describe("iconName validation", () => {
		it("should fail if iconName is not a valid ButtonType", () => {
			const result = ButtonPropsSchema.safeParse({
				...baseValidProps,
				iconName: "invalid-icon",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				// Zod enum 에러 메시지는 조금 다를 수 있습니다.
				expect(result.error.format().iconName?._errors[0]).toBeDefined();
			}
		});
	});

	describe("class validation (ClassValueSchema)", () => {
		it("should validate with string class", () => {
			const result = ButtonPropsSchema.safeParse({
				...baseValidProps,
				class: "my-class another-class",
			});
			expect(result.success).toBe(true);
		});

		it("should validate with array class", () => {
			const result = ButtonPropsSchema.safeParse({
				...baseValidProps,
				class: ["class1", "class2"],
			});
			expect(result.success).toBe(true);
		});

		it("should validate with object class", () => {
			const result = ButtonPropsSchema.safeParse({
				...baseValidProps,
				class: { class1: true, class2: false, class3: "string" },
			});
			expect(result.success).toBe(true);
		});

		it("should validate with mixed array class (recursive)", () => {
			const result = ButtonPropsSchema.safeParse({
				...baseValidProps,
				class: ["class1", { class2: true }, ["class3"]],
			});
			expect(result.success).toBe(true);
		});

		it("should fail with invalid class type (number)", () => {
			const result = ButtonPropsSchema.safeParse({
				...baseValidProps,
				class: 123,
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.format().class?._errors[0]).toBeDefined(); // 구체적인 메시지는 ClassValueSchema 정의에 따라 달라짐
			}
		});

		it("should fail with invalid array content", () => {
			const result = ButtonPropsSchema.safeParse({
				...baseValidProps,
				class: [123],
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.format().class?._errors).toBeDefined();
			}
		});

		it("should fail with invalid object content", () => {
			const result = ButtonPropsSchema.safeParse({
				...baseValidProps,
				class: { class1: {} },
			}); // 객체 값은 boolean, string, number, null, undefined여야 함
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.format().class?._errors).toBeDefined();
			}
		});
	});

	// buttonText, buttonValue에 대한 문자열 타입 검증 등 추가할 수 있습니다.
	it("should fail if buttonText is not a string", () => {
		const result = ButtonPropsSchema.safeParse({
			...baseValidProps,
			buttonText: 123,
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.format().buttonText?._errors[0]).toContain(
				"'buttonText' 값은 문자열이어야 합니다.",
			);
		}
	});
});
