<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import type { ClassValue } from 'svelte/elements';

	import Logo from './Logo.svelte';
	import Toolbar from './Toolbar.svelte';

	const { class: class_ } = $props<{
		class?: ClassValue;
	}>();
</script>

<!-- 
Header component with optimized layout structure
Logo container grows to fit content with minimum dimensions
Toolbar takes remaining space for maximum utilization

---

헤더 컴포넌트 최적화된 레이아웃 구조
로고 컨테이너는 내용에 맞게 확장되며 최소 크기 보장
툴바는 남은 공간을 모두 활용
-->
<header
	class={twMerge(
		'flex items-center justify-center gap-2 border-b border-gray-300 bg-gray-200 p-2',
		class_
	)}
>
	<!-- Logo Container: Natural width with minimum dimensions and no shrink -->
	<!-- 로고 컨테이너: 최소 크기 보장 및 축소 방지, 자연스러운 너비 -->
	<div class="flex flex-shrink-0 items-center justify-start">
		<Logo />
	</div>

	<!-- Toolbar Container: Takes all remaining space -->
	<!-- 툴바 컨테이너: 남은 공간 모두 차지 -->
	<div class="flex flex-1 items-center justify-start">
		<Toolbar />
	</div>
</header>
