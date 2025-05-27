<script lang="ts">
	const {
		currentFrameIndex = 0,
		totalFrames = 1,
		showProgressText = true
	} = $props<{
		currentFrameIndex: number;
		totalFrames: number;
		showProgressText?: boolean;
	}>();

	const progressPercentage = $derived(
		totalFrames > 1 ? ((currentFrameIndex + 1) / totalFrames) * 100 : 0
	);
</script>

{#if totalFrames > 1}
	<div class="flex h-4 items-center gap-2 text-xs text-gray-600">
		{#if showProgressText}
			<span class="min-w-[3em] flex-shrink-0 text-right text-xs">
				{currentFrameIndex + 1}/{totalFrames}
			</span>
		{/if}
		<div class="flex-1 rounded-full bg-gray-200">
			<div
				class="transition-width h-1 rounded-full bg-blue-500 duration-150"
				style="width: {progressPercentage}%"
			></div>
		</div>
	</div>
{:else}
	<!-- totalFrames가 1 이하일 때는 공간 차지를 위해 빈 div 또는 최소 높이 div를 둘 수 있으나, 여기서는 아무것도 표시하지 않음 -->
	<!-- 필요시 <div class="h-4"></div> 와 같이 고정 높이 플레이스홀더 추가 가능 -->
{/if}
