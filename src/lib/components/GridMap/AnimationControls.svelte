<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import Icon from '$lib/icons/Icon.svelte';

	const {
		currentFrameIndex = 0,
		totalFrames = 0,
		isPlaying = false,
		onPlay = undefined,
		onPause = undefined,
		onReset = undefined,
		onPrevious = undefined,
		onNext = undefined,
		onGoToEnd = undefined,
		onSetFrame = undefined,
		class: userClass = ''
	} = $props<{
		/**
		 * Current frame index (0-based)
		 * 현재 프레임 인덱스 (0부터 시작)
		 */
		currentFrameIndex: number;

		/**
		 * Total number of frames
		 * 전체 프레임 수
		 */
		totalFrames: number;

		/**
		 * Whether animation is currently playing
		 * 애니메이션이 현재 재생 중인지 여부
		 */
		isPlaying: boolean;

		/**
		 * Callback for play action
		 * 재생 액션 콜백
		 */
		onPlay?: () => void;

		/**
		 * Callback for pause action
		 * 일시정지 액션 콜백
		 */
		onPause?: () => void;

		/**
		 * Callback for reset action
		 * 리셋 액션 콜백
		 */
		onReset?: () => void;

		/**
		 * Callback for previous frame action
		 * 이전 프레임 액션 콜백
		 */
		onPrevious?: () => void;

		/**
		 * Callback for next frame action
		 * 다음 프레임 액션 콜백
		 */
		onNext?: () => void;

		/**
		 * Callback for go to end action
		 * 마지막으로 이동 액션 콜백
		 */
		onGoToEnd?: () => void;

		/**
		 * Callback for setting specific frame
		 * 특정 프레임 설정 콜백
		 */
		onSetFrame?: (frameIndex: number) => void;

		/**
		 * Additional CSS classes
		 * 추가 CSS 클래스
		 */
		class?: ClassValue;
	}>();

	function togglePlayPause() {
		if (isPlaying) {
			onPause?.();
		} else {
			onPlay?.();
		}
	}

	// Fixed timeline length to prevent layout shifts
	// 레이아웃 시프트를 방지하기 위한 고정 타임라인 길이
	const FIXED_TIMELINE_DOTS = 20; // 충분한 개수로 설정, 실제 보이는 것은 totalFrames에 따름
	const timelineDotPlaceholders = Array.from({ length: FIXED_TIMELINE_DOTS }, (_, i) => i);
</script>

<!-- Fixed height container to prevent any layout shifts -->
<!-- 레이아웃 시프트를 방지하기 위한 고정 높이 컨테이너 (h-16 = 4rem = 64px) -->
<div
	class="flex h-16 flex-col gap-1 {userClass}"
	style="opacity: {totalFrames > 1 ? '1' : '0'}; pointer-events: {totalFrames > 1
		? 'auto'
		: 'none'};"
>
	<!-- Progress Bar - Fixed height: h-4 (1rem = 16px) -->
	<div class="flex h-4 items-center gap-2 text-xs text-gray-600">
		<span class="min-w-[3em] flex-shrink-0 text-right text-xs">
			{totalFrames > 1 ? currentFrameIndex + 1 : '-'}/{totalFrames > 1 ? totalFrames : '-'}
		</span>
		<div class="flex-1 rounded-full bg-gray-200">
			<div
				class="transition-width h-1 rounded-full bg-blue-500 duration-150"
				style="width: {totalFrames > 1 ? ((currentFrameIndex + 1) / totalFrames) * 100 : 0}%"
			></div>
		</div>
	</div>

	<!-- Control Buttons - Fixed height: h-7 (1.75rem = 28px) -->
	<div class="flex h-7 items-center justify-center gap-1">
		<button
			class="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
			onclick={onReset}
			disabled={currentFrameIndex === 0 || totalFrames <= 1}
			title="Reset to start"
		>
			⏮
		</button>
		<button
			class="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
			onclick={onPrevious}
			disabled={totalFrames <= 1}
			title="Previous frame"
		>
			◀
		</button>
		<!-- Play/Pause button with fixed dimensions -->
		<button
			class="flex h-7 w-7 items-center justify-center rounded bg-blue-500 text-xs text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
			onclick={togglePlayPause}
			disabled={totalFrames <= 1}
			title={isPlaying ? 'Pause' : 'Play'}
		>
			<!-- Fixed size inner wrapper for icon/text -->
			<div class="flex h-3 w-3 items-center justify-center">
				{#if isPlaying}
					<span class="text-xs">⏸</span>
				{:else}
					<Icon iconName="play" width={12} height={12} />
				{/if}
			</div>
		</button>
		<button
			class="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
			onclick={onNext}
			disabled={totalFrames <= 1}
			title="Next frame"
		>
			▶
		</button>
		<button
			class="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
			onclick={onGoToEnd}
			disabled={currentFrameIndex === totalFrames - 1 || totalFrames <= 1}
			title="Go to end"
		>
			⏭
		</button>
	</div>

	<!-- Frame Timeline - Fixed height: h-4 (1rem = 16px), overflow-hidden -->
	<div class="flex h-4 items-center justify-center gap-1 overflow-hidden py-1">
		{#each timelineDotPlaceholders as _, index (index)}
			{@const isActiveDot = currentFrameIndex === index}
			{@const isVisibleDot = index < totalFrames && totalFrames > 1}
			<button
				class="h-2 w-2 min-w-2 flex-shrink-0 rounded-full border transition-all {isVisibleDot
					? isActiveDot
						? 'border-blue-500 bg-blue-500'
						: 'border-gray-300 bg-gray-100 hover:bg-gray-200'
					: 'border-transparent bg-transparent'}"
				style="visibility: {isVisibleDot ? 'visible' : 'hidden'};"
				onclick={() => {
					if (isVisibleDot) onSetFrame?.(index);
				}}
				disabled={!isVisibleDot}
				title={isVisibleDot ? `Frame ${index + 1}` : ''}
				aria-label={isVisibleDot ? `Go to frame ${index + 1}` : ''}
			></button>
		{/each}
	</div>
</div>
