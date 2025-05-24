<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { Button } from './Button';
	import { twMerge } from 'tailwind-merge';

	const { class: className } = $props<{ class: ClassValue }>();
</script>

<div
	class={twMerge(
		'flex w-[200px] flex-1 flex-col gap-[10px] border-r border-gray-300 bg-gray-100 p-5',
		className
	)}
>
	<Button iconName="pencil" />
	<Button iconName="bin" />
	<!-- 
		NOTE: 플레이 모드는 제거함.
		      현재 연구에서 플레이어 타일이 존재하지 않음, 기본 위치를 정할 수 없어서 플레이 모드를 제거함.
	-->
	<!-- <Button iconName="play" /> -->
	<Button iconName="share" />
</div>
