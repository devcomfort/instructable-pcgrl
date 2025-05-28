<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Grid from './Grid.svelte';
	import type { GridMap } from '$lib/core/grid-map';
	import type { ClassValue } from 'svelte/elements';
	import Icon from '$lib/icons/Icon.svelte';

	const {
		states = [],
		agentPositions = undefined,
		showBorders = true,
		editMode = false,
		interval = 500,
		autoPlay = false,
		showControls = true,
		gridOnly = false,
		class: userClass = '',
		onFrameChange = undefined
	} = $props<{
		/**
		 * Array of GridMap states to animate through
		 * 애니메이션할 GridMap 상태들의 배열
		 */
		states: GridMap[];

		/**
		 * Array of agent positions for each frame
		 * 각 프레임에 대한 에이전트 위치 배열
		 */
		agentPositions?: Array<[number, number]>;

		/**
		 * Whether to show borders around the grid
		 * 그리드 주변에 경계선을 표시할지 여부
		 */
		showBorders?: boolean;

		/**
		 * Whether to enable edit mode for the grid
		 * 그리드의 편집 모드를 활성화할지 여부
		 */
		editMode?: boolean;

		/**
		 * Animation interval in milliseconds
		 * 애니메이션 간격 (밀리초)
		 */
		interval?: number;

		/**
		 * Whether to start animation automatically
		 * 애니메이션을 자동으로 시작할지 여부
		 */
		autoPlay?: boolean;

		/**
		 * Whether to show animation controls
		 * 애니메이션 컨트롤을 표시할지 여부
		 */
		showControls?: boolean;

		/**
		 * Whether to show only the grid without controls
		 * 컨트롤 없이 그리드만 표시할지 여부
		 */
		gridOnly?: boolean;

		/**
		 * Additional CSS classes
		 * 추가 CSS 클래스
		 */
		class?: ClassValue;

		/**
		 * Callback when frame changes
		 * 프레임 변경 시 콜백
		 */
		onFrameChange?: (frameIndex: number, state: GridMap) => void;
	}>();

	// Animation state
	let currentFrameIndex = $state(0);
	let isPlaying = $state(autoPlay);
	let animationTimer: ReturnType<typeof setInterval> | null = null;

	// Current state to display
	const currentState = $derived(states[currentFrameIndex] || null);
	const currentAgentPosForFrame = $derived(
		agentPositions && currentFrameIndex < agentPositions.length
			? agentPositions[currentFrameIndex]
			: null
	);
	const totalFrames = $derived(states.length);
	const hasStates = $derived(states.length > 1);

	/**
	 * Start the animation
	 * 애니메이션 시작
	 */
	function startAnimation() {
		if (!hasStates) return;

		isPlaying = true;
		animationTimer = setInterval(() => {
			const nextFrame = (currentFrameIndex + 1) % totalFrames;
			setFrame(nextFrame);
		}, interval);
	}

	/**
	 * Stop the animation
	 * 애니메이션 정지
	 */
	function stopAnimation() {
		isPlaying = false;
		if (animationTimer) {
			clearInterval(animationTimer);
			animationTimer = null;
		}
	}

	/**
	 * Toggle play/pause
	 * 재생/일시정지 토글
	 */
	function togglePlayPause() {
		if (isPlaying) {
			stopAnimation();
		} else {
			startAnimation();
		}
	}

	/**
	 * Set specific frame
	 * 특정 프레임으로 설정
	 */
	function setFrame(frameIndex: number) {
		if (frameIndex >= 0 && frameIndex < totalFrames) {
			currentFrameIndex = frameIndex;
			if (onFrameChange && currentState) {
				onFrameChange(frameIndex, currentState);
			}
		}
	}

	/**
	 * Go to previous frame
	 * 이전 프레임으로 이동
	 */
	function previousFrame() {
		const prevFrame = currentFrameIndex > 0 ? currentFrameIndex - 1 : totalFrames - 1;
		setFrame(prevFrame);
	}

	/**
	 * Go to next frame
	 * 다음 프레임으로 이동
	 */
	function nextFrame() {
		const nextFrame = (currentFrameIndex + 1) % totalFrames;
		setFrame(nextFrame);
	}

	/**
	 * Reset to first frame
	 * 첫 번째 프레임으로 리셋
	 */
	function resetToStart() {
		stopAnimation();
		setFrame(0);
	}

	// Auto-play on mount if enabled
	onMount(() => {
		if (autoPlay && hasStates) {
			startAnimation();
		}
	});

	// Cleanup on destroy
	onDestroy(() => {
		stopAnimation();
	});

	// Stop animation when component is no longer visible or states change
	$effect(() => {
		if (!hasStates && isPlaying) {
			stopAnimation();
		}
		if (
			import.meta.env.DEV &&
			agentPositions &&
			states &&
			agentPositions.length !== states.length &&
			states.length > 0 &&
			agentPositions.length > 0
		) {
			console.warn(
				`[MapAnimation] Mismatch between states length (${states.length}) and agentPositions length (${agentPositions.length}). Agent highlighting may be inconsistent.`
			);
		}
	});
</script>

{#if gridOnly}
	<!-- Grid Only Mode - Just the grid without any wrapper -->
	<!-- 그리드 전용 모드 - 래퍼 없이 그리드만 표시 -->
	<div class={userClass}>
		{#if currentState}
			<Grid gridMap={currentState} {showBorders} {editMode} agentPos={currentAgentPosForFrame} />
		{:else}
			<div
				class="flex aspect-square items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50"
			>
				<span class="text-sm text-gray-500">No animation data</span>
			</div>
		{/if}
	</div>
{:else}
	<!-- Full Animation Component with Controls -->
	<!-- 컨트롤이 포함된 전체 애니메이션 컴포넌트 -->
	<div class="flex h-full flex-col {userClass}">
		<!-- Grid Display Area - Takes most of the space -->
		<!-- 그리드 표시 영역 - 대부분의 공간을 차지 -->
		<div class="mb-2 min-h-0 flex-1">
			{#if currentState}
				<Grid gridMap={currentState} {showBorders} {editMode} agentPos={currentAgentPosForFrame} />
			{:else}
				<div
					class="flex aspect-square items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50"
				>
					<span class="text-sm text-gray-500">No animation data</span>
				</div>
			{/if}
		</div>

		<!-- Animation Controls - Compact fixed height -->
		<!-- 애니메이션 컨트롤 - 컴팩트한 고정 높이 -->
		{#if hasStates && showControls}
			<div class="flex-shrink-0">
				<div class="flex flex-col gap-1">
					<!-- Progress Bar -->
					<!-- 진행 표시줄 -->
					<div class="flex items-center gap-2 text-xs text-gray-600">
						<span class="min-w-fit text-xs">{currentFrameIndex + 1}/{totalFrames}</span>
						<div class="flex-1 rounded-full bg-gray-200">
							<div
								class="h-1 rounded-full bg-blue-500 transition-all duration-200"
								style="width: {((currentFrameIndex + 1) / totalFrames) * 100}%"
							></div>
						</div>
					</div>

					<!-- Control Buttons - Made more compact -->
					<!-- 컨트롤 버튼 - 더 컴팩트하게 -->
					<div class="flex items-center justify-center gap-1">
						<button
							class="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
							onclick={(e) => {
								e.stopPropagation();
								resetToStart();
							}}
							disabled={currentFrameIndex === 0}
							title="Reset to start"
						>
							⏮
						</button>

						<button
							class="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs text-gray-600 transition-colors hover:bg-gray-200"
							onclick={(e) => {
								e.stopPropagation();
								previousFrame();
							}}
							title="Previous frame"
						>
							◀
						</button>

						<button
							class="flex h-7 w-7 items-center justify-center rounded bg-blue-500 text-xs text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
							onclick={(e) => {
								e.stopPropagation();
								togglePlayPause();
							}}
							disabled={!hasStates}
							title={isPlaying ? 'Pause' : 'Play'}
						>
							{#if isPlaying}
								<span class="text-xs">❚❚</span>
							{:else}
								<Icon iconName="play" width={12} height={12} />
							{/if}
						</button>

						<button
							class="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs text-gray-600 transition-colors hover:bg-gray-200"
							onclick={(e) => {
								e.stopPropagation();
								nextFrame();
							}}
							title="Next frame"
						>
							▶
						</button>

						<button
							class="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
							onclick={(e) => {
								e.stopPropagation();
								setFrame(totalFrames - 1);
							}}
							disabled={currentFrameIndex === totalFrames - 1}
							title="Go to end"
						>
							⏭
						</button>
					</div>

					<!-- Frame Timeline (clickable) -->
					<!-- 프레임 타임라인 (클릭 가능) -->
					<div class="flex items-center justify-center gap-1 overflow-x-auto py-1">
						{#each Array(totalFrames) as _, index (index)}
							<button
								class="h-2 w-2 min-w-2 flex-shrink-0 rounded-full border transition-all {currentFrameIndex ===
								index
									? 'border-blue-500 bg-blue-500'
									: 'border-gray-300 bg-gray-100 hover:bg-gray-200'}"
								onclick={(e) => {
									e.stopPropagation();
									setFrame(index);
								}}
								title="Frame {index + 1}"
								aria-label="Go to frame {index + 1}"
							></button>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
