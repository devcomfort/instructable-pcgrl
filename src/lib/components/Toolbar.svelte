<script lang="ts">
	import StepSizeController from './StepSizeController.svelte';
	import History from './History.svelte';
	import { defaultMapState, mapState } from '$lib/store/editor';
	import Button from './Button/Button.svelte';
</script>

<!-- 
Toolbar component with full space utilization
Removes restrictive styling to allow maximum width usage

---

전체 공간 활용 툴바 컴포넌트
제한적인 스타일링 제거로 최대 너비 사용 허용
-->
<div class="flex w-full items-center gap-4">
	<!-- 
		Component for managing and displaying the history of actions.
		---
		작업 히스토리를 관리하고 표시하는 컴포넌트입니다.
	-->
	<History />

	<!-- 
		Component for controlling the step size.
		---
		단계 크기를 조절하는 컴포넌트입니다.
	-->
	<StepSizeController />

	<Button
		iconName="bin"
		onclick={() => {
			mapState.set($defaultMapState);
		}}
	/>
	<!-- 
		NOTE: 플레이 모드는 제거함.
		      현재 연구에서 플레이어 타일이 존재하지 않음, 기본 위치를 정할 수 없어서 플레이 모드를 제거함.
	-->
	<!-- <Button iconName="play" /> -->
	<Button iconName="share" />
</div>
