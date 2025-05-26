<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import type { IconName } from '$lib/icons';
	import type { ButtonProps } from './button-props';
	import { IconSet } from '$lib/icons';
	import { ButtonPropsSchema } from './button-props';
	import type { FormattedZodErrors } from '$lib/core';

	import * as S from 'fp-ts/string';
	import * as R from 'fp-ts/Record';

	let iconId: IconName | undefined = $state(undefined);

	// Define props with default values
	const {
		onclick = () => {},
		iconName,
		selected = $bindable(false),
		href,
		buttonText = '',
		buttonValue,
		class: _class
	}: ButtonProps = $props();

	// 프로퍼티 유효성 검사
	$effect(() => {
		try {
			// 프로퍼티 값들을 객체로 모아서 검증
			const props = {
				onclick,
				iconName,
				selected,
				href,
				buttonText,
				buttonValue,
				class: _class
			};

			// Zod 스키마로 유효성 검사
			const result = ButtonPropsSchema.safeParse(props);

			// 검증 실패 시 콘솔 에러 출력
			if (!result.success) {
				const formattedErrors: FormattedZodErrors<typeof ButtonPropsSchema> = result.error.format();
				console.error('[Button] 유효하지 않은 파라미터:', formattedErrors);

				// href 속성 검증 오류 시 추가 도움말 제공
				if (formattedErrors.href?._errors) {
					console.info(
						'[Button] href 속성은 "http://" 또는 "https://"로 시작하는 완전한 URL 형식이어야 합니다.'
					);
				}
			}
		} catch (error) {
			console.error('[Button] 유효성 검사 중 오류 발생:', error);
		}
	});

	$effect(() => {
		// iconName -> iconId 변환 로직
		if (!iconName) {
			iconId = undefined;
			return;
		}

		// 아이콘 이름이 유효한지 확인
		const hasKey = S.isString(iconName) && R.has(iconName, IconSet);
		iconId = hasKey ? (iconName as IconName) : undefined;

		if (!hasKey && iconName) {
			console.error(`[Button] 유효하지 않은 아이콘 이름: ${iconName}`);
		}
	});
</script>

{#if href}
	<a {href} target="_blank" rel="noopener noreferrer">
		<button
			type="button"
			data-testdi="button-component"
			class={`inline-flex items-center justify-center rounded-xl bg-white p-4 transition-all hover:bg-gray-200 focus:bg-gray-200 focus:outline-offset-[-4px] focus:outline-white focus:outline-none active:scale-[0.99] ${_class ? _class : ''}`}
			onclick={(e) => (onclick ? onclick(e) : null)}
		>
			{#if iconId}
				<Icon iconName={iconId} />
			{:else}
				<span class="text-black">{buttonText}</span>
			{/if}
		</button>
	</a>
{:else}
	<button
		type="button"
		data-testdi="button-component"
		class={`inline-flex items-center justify-center rounded-xl bg-white p-4 transition-all hover:bg-gray-200 focus:bg-gray-200 focus:outline-offset-[-4px] focus:outline-white focus:outline-none active:scale-[0.99] ${_class ? _class : ''}`}
		onclick={(e) => (onclick ? onclick(e) : null)}
	>
		{#if iconId}
			<Icon iconName={iconId} />
		{:else}
			<span class="text-black">{buttonText}</span>
		{/if}
	</button>
{/if}
