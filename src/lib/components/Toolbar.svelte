<script lang="ts">
	import { defaultMapState, mapState, mapSize } from '$lib/store/editor';
	import { copyTextToClipboard } from '$lib/utils';
	import toast from 'svelte-french-toast';
	import { generateRandomMap } from '$lib/utils/map-utils';

	import StepSizeController from './StepSizeController.svelte';
	import History from './History.svelte';
	import Button from './Button/Button.svelte';

	const handleShareClick = async () => {
		const url = window.location.href;
		const copyResult = await copyTextToClipboard(url);

		if (copyResult instanceof Error) {
			toast.error('Failed to copy URL.');
		} else {
			toast.success('URL copied to clipboard.');
		}
	};

	const handleGenerateRandomMap = () => {
		const currentMapSize = $mapSize;
		const randomMap = generateRandomMap(currentMapSize.gridSize);
		mapState.set(randomMap);
		toast.success('Random map generated.');
	};
</script>

<!-- 
Toolbar component with full space utilization
Removes restrictive styling to allow maximum width usage

---

전체 공간 활용 툴바 컴포넌트
제한적인 스타일링 제거로 최대 너비 사용 허용
-->
<div class="flex w-full items-center gap-2">
	<!-- 
		Component for controlling the step size.
		---
		단계 크기를 조절하는 컴포넌트입니다.
	-->
	<StepSizeController />

	<!-- 
		History component for undo/redo actions.
		---
		실행 취소/다시 실행을 위한 히스토리 컴포넌트입니다.
	-->
	<History />

	<Button iconName="random" onclick={handleGenerateRandomMap} title="Generate Random Map" />

	<Button
		iconName="bin"
		onclick={() => {
			mapState.set($defaultMapState);
			toast.success('Data has been reset.');
		}}
	/>
	<!-- 
		NOTE: 플레이 모드는 제거함.
		      현재 연구에서 플레이어 타일이 존재하지 않음, 기본 위치를 정할 수 없어서 플레이 모드를 제거함.
	-->
	<!-- <Button iconName="play" /> -->
	<Button iconName="share" onclick={handleShareClick} />
</div>
