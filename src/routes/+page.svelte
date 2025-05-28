<script lang="ts">
	import Grid from '$lib/components/GridMap/Grid.svelte';
	import MapAnimation from '$lib/components/GridMap/MapAnimation.svelte';
	import SimpleProgressBar from '$lib/components/GridMap/SimpleProgressBar.svelte';
	import type { GridMap } from '$lib/core/grid-map';
	import { mapState } from '$lib/store/editor';
	import { mapCandidates, type MapCandidate } from '$lib/store/editor/map-candidates';
	import { animationConfig, logAnimationConfig } from '$lib/utils/env';
	import { onDestroy } from 'svelte';

	// Selection animation state
	let isPlayingSelectionAnimation = $state(false);
	let selectionAnimationStates: GridMap[] = $state([]);
	let selectionAnimationAgentPositions: Array<[number, number]> = $state([]);
	let selectedCandidate: MapCandidate | null = $state(null);
	let currentAnimationFrameIndex = $state(0);
	let currentAnimationAgentPos = $state<[number, number] | null>(null);
	let animationTimer: ReturnType<typeof setInterval> | null = null;
	let pendingCompletionTimeout: ReturnType<typeof setTimeout> | null = null;

	// biome-ignore lint/style/useConst: Svelte 5 문법 때문에 무시함.
	let gridDisplayContainerWidth = $state(0);
	// biome-ignore lint/style/useConst: Svelte 5 문법 때문에 무시함.
	let gridDisplayContainerHeight = $state(0);

	// Derived state for grid size using Svelte 5 rune $derived
	// biome-ignore lint/style/useConst: Svelte 5 문법 때문에 무시함.
	let commonSize = $derived(
		Math.max(0, Math.min(gridDisplayContainerWidth, gridDisplayContainerHeight) - 2)
	);

	// Log animation configuration on component load
	logAnimationConfig();

	// 환경 변수에 따라, 실제 agent_pos 데이터가 없을 경우 표시할 임시 에이전트 위치
	const agentPosForDisplayIfDataMissing = $derived.by(() => {
		if (
			$animationConfig.showAgentPosition &&
			!currentAnimationAgentPos &&
			$mapState &&
			$mapState.length > 0 &&
			$mapState[0].length > 0
		) {
			const centerRow = Math.floor($mapState.length / 2);
			const centerCol = Math.floor($mapState[0].length / 2);
			if (import.meta.env.DEV)
				console.log('[Page] Displaying agent position at center (env enabled, no data):', [
					centerRow,
					centerCol
				]);
			return [centerRow, centerCol] as [number, number];
		}
		return null;
	});

	/**
	 * Handle clicking on a map candidate
	 * Updates the current mapState with the selected candidate
	 * Optionally plays selection animation if enabled
	 *
	 * ---
	 *
	 * 맵 후보 클릭 처리
	 * 선택된 후보로 현재 mapState를 업데이트합니다
	 * 선택 애니메이션이 활성화된 경우 애니메이션을 재생합니다
	 */
	function handleCandidateClick(candidate: MapCandidate) {
		stopSelectionAnimation(true);
		selectedCandidate = candidate;

		if ($animationConfig.selectionAnimationMode && candidate.states.length > 1) {
			selectionAnimationStates = candidate.states;
			selectionAnimationAgentPositions = candidate.agentPositions || [];
			currentAnimationFrameIndex = 0;
			setAnimationFrame(0);
			startSelectionAnimation();
			if (import.meta.env.DEV) {
				console.log(
					'[Page] Playing selection animation with',
					candidate.states.length,
					'frames. Agent positions available:',
					selectionAnimationAgentPositions.length > 0,
					'Instruction:',
					candidate.instruction
				);
			}
		} else {
			mapState.set(candidate.map);
			if (candidate.agentPositions && candidate.agentPositions.length > 0) {
				currentAnimationAgentPos = candidate.agentPositions.at(-1) ?? null;
			} else {
				currentAnimationAgentPos = null;
			}
			if (import.meta.env.DEV) {
				console.log(
					'[Page] Map candidate selected (no animation). Instruction:',
					candidate.instruction,
					'Final agentPos:',
					currentAnimationAgentPos
				);
			}
		}
	}

	/**
	 * Handle selection animation completion
	 * 선택 애니메이션 완료 처리
	 */
	function handleSelectionAnimationComplete() {
		if (selectedCandidate) {
			mapState.set(selectedCandidate.map);
			stopSelectionAnimation(false);
			if (import.meta.env.DEV) {
				console.log(
					'[Page] Selection animation completed. mapState updated. Final agentPos:',
					currentAnimationAgentPos
				);
			}
		}
	}

	/**
	 * Start selection animation
	 * 선택 애니메이션 시작
	 */
	function startSelectionAnimation() {
		if (selectionAnimationStates.length <= 1) return;

		isPlayingSelectionAnimation = true;
		if (animationTimer) {
			clearInterval(animationTimer);
			animationTimer = null;
		}

		animationTimer = setInterval(() => {
			if (!isPlayingSelectionAnimation) {
				if (animationTimer) {
					clearInterval(animationTimer);
					animationTimer = null;
				}
				return;
			}

			const nextFrameIndex = currentAnimationFrameIndex + 1;

			if (nextFrameIndex >= selectionAnimationStates.length) {
				if (animationTimer) {
					clearInterval(animationTimer);
					animationTimer = null;
				}
				setAnimationFrame(selectionAnimationStates.length - 1);
				isPlayingSelectionAnimation = false;
				handleSelectionAnimationComplete();
			} else {
				setAnimationFrame(nextFrameIndex);
			}
		}, $animationConfig.selectionAnimationInterval);
	}

	/**
	 * Stop selection animation
	 * 선택 애니메이션 정지
	 */
	function stopSelectionAnimation(resetAllStates = true) {
		isPlayingSelectionAnimation = false;
		if (animationTimer) {
			clearInterval(animationTimer);
			animationTimer = null;
		}
		if (pendingCompletionTimeout) {
			clearTimeout(pendingCompletionTimeout);
			pendingCompletionTimeout = null;
		}
		currentAnimationFrameIndex = 0;
		currentAnimationAgentPos = null;
		selectionAnimationStates = [];
		selectionAnimationAgentPositions = [];
		selectedCandidate = null;
	}

	/**
	 * Set specific animation frame
	 * 특정 애니메이션 프레임 설정
	 */
	function setAnimationFrame(frameIndex: number) {
		if (
			selectionAnimationStates &&
			frameIndex >= 0 &&
			frameIndex < selectionAnimationStates.length
		) {
			currentAnimationFrameIndex = frameIndex;
			mapState.set(selectionAnimationStates[frameIndex]);

			if (
				selectionAnimationAgentPositions &&
				frameIndex < selectionAnimationAgentPositions.length
			) {
				currentAnimationAgentPos = selectionAnimationAgentPositions[frameIndex];
			} else {
				currentAnimationAgentPos = null;
			}

			if (import.meta.env.DEV) {
				// console.log(
				// 	`[Page] Set Frame ${frameIndex}. currentAnimationAgentPos: `,
				// 	currentAnimationAgentPos
				// );
			}
		} else if (
			selectionAnimationStates &&
			selectionAnimationStates.length === 0 &&
			frameIndex === 0
		) {
			currentAnimationFrameIndex = 0;
			currentAnimationAgentPos = null;
		}
	}

	/**
	 * Animation control handlers
	 * 애니메이션 컨트롤 핸들러들
	 */
	const animationControlHandlers = {
		onPlay: startSelectionAnimation,
		onPause: () => {
			if (animationTimer) {
				clearInterval(animationTimer);
				animationTimer = null;
			}
		},
		onReset: () => {
			stopSelectionAnimation();
			if (selectionAnimationStates.length > 0) {
				setAnimationFrame(0);
			}
		},
		onPrevious: () => {
			const prevFrame =
				currentAnimationFrameIndex > 0
					? currentAnimationFrameIndex - 1
					: selectionAnimationStates.length - 1;
			setAnimationFrame(prevFrame);
		},
		onNext: () => {
			const nextFrame = (currentAnimationFrameIndex + 1) % selectionAnimationStates.length;
			setAnimationFrame(nextFrame);
		},
		onGoToEnd: () => {
			setAnimationFrame(selectionAnimationStates.length - 1);
		},
		onSetFrame: setAnimationFrame
	};

	// Cleanup on component destroy
	onDestroy(() => {
		stopSelectionAnimation(true);
	});
</script>

<!-- 
=== MAIN PAGE LAYOUT - HORIZONTAL SPLIT DESIGN ===

이 컴포넌트는 메인 페이지의 콘텐츠 영역을 구성합니다.
+layout.svelte의 slot 영역에 배치되어 좌측 4/5 공간을 차지합니다.

🎯 PAGE OBJECTIVES (페이지 목표):
1. 맵 후보들과 현재 선택된 맵을 효율적으로 표시
2. 좌우 분할 레이아웃으로 비교 및 선택 용이성 제공
3. 좌측 영역에서만 스크롤 허용 (맵 후보 목록)
4. 우측 영역은 스크롤 없이 전체 맵 표시

📐 LAYOUT STRUCTURE (레이아웃 구조):
┌─────────────────────────────────────┐ ← h-full (부모로부터 전체 높이 상속)
│ ┌─────────────────┬─────────────────┐│
│ │ Map Candidates  │ Current Map     ││ ← grid-cols-2 (1:1 비율)
│ │ ┌─────────────┐ │ ┌─────────────┐ ││
│ │ │ Title       │ │ │ Title       │ ││ ← flex-shrink-0 (고정 크기)
│ │ └─────────────┘ │ └─────────────┘ ││
│ │ ┌─────────────┐ │ ┌─────────────┐ ││
│ │ │ Scrollable  │ │ │ No Scroll   │ ││
│ │ │ Grid        │ │ │ Full View   │ ││
│ │ │ ↕ SCROLL    │ │ │             │ ││
│ │ └─────────────┘ │ └─────────────┘ ││
│ └─────────────────┴─────────────────┘│
└─────────────────────────────────────┘

🔑 KEY FEATURES (주요 기능):
- 좌측: 맵 후보 그리드, 세로 스크롤 가능
- 우측: 현재 선택된 맵, 전체 크기로 표시
- 반응형: lg:grid-cols-2, xl:grid-cols-3으로 후보 표시 최적화
- 접근성: 키보드 네비게이션 및 ARIA 라벨 지원

⚠️  LAYOUT WARNINGS (레이아웃 경고):
- h-full 제거 시 높이 계산 오류
- min-h-0 제거 시 flex item shrinking 문제
- overflow-hidden → overflow-visible 변경 시 스크롤바 누출
- flex-shrink-0 제거 시 제목 영역 축소 문제

=== END SECTION ===
-->
<div class="grid h-full min-h-0 grid-cols-2 gap-0">
	<!-- Map Candidates Section (Left Half) -->
	<!-- 맵 후보 영역 (좌측 절반) - 스크롤 가능한 그리드 표시 -->
	<div class="flex min-h-0 flex-col gap-4 border-r-2 border-gray-300 p-4">
		<!-- Fixed Title Area - Never shrinks -->
		<!-- 고정 제목 영역 - 절대 축소되지 않음 -->
		<div class="flex-shrink-0">
			<h2 class="text-xl font-bold text-gray-800">Map Candidates</h2>
			<p class="text-sm text-gray-600">Click on a candidate to select it</p>
		</div>

		<!-- Scrollable Content Area - Takes remaining space -->
		<!-- 스크롤 가능한 콘텐츠 영역 - 남은 공간을 모두 차지 -->
		<div class="min-h-0 flex-1 overflow-y-auto">
			{#if $mapCandidates.length === 0}
				<!-- Empty state message -->
				<div class="flex h-full items-center justify-center">
					<div class="text-center text-gray-500">
						<p class="text-lg font-medium">No candidates available yet</p>
						<p class="mt-2 text-sm">Use the chat interface to generate map candidates with AI</p>
					</div>
				</div>
			{:else}
				<!-- Candidates grid display with responsive columns -->
				<!-- 반응형 컬럼을 가진 후보 그리드 표시 -->
				<div class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
					{#each $mapCandidates as candidate, index (candidate.episodeId)}
						<div
							class="cursor-pointer rounded-lg border-2 border-gray-200 p-2 transition-all hover:border-blue-500 hover:shadow-md"
							onclick={() => handleCandidateClick(candidate)}
							role="button"
							tabindex="0"
							aria-label="Select map candidate {index + 1}: {candidate.instruction}"
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleCandidateClick(candidate);
								}
							}}
						>
							<div class="mb-2 text-center">
								<span class="text-xs font-medium text-gray-600">Candidate {index + 1}</span>
							</div>
							<!-- Flex layout with Grid and Instruction label -->
							<!-- Grid와 Instruction 라벨이 포함된 Flex 레이아웃 -->
							<div class="flex flex-col gap-2">
								<!-- Instruction label displayed above the grid for consistency -->
								<!-- 통일성을 위해 그리드 위에 표시되는 Instruction 라벨 -->
								<div class="max-h-8 overflow-hidden text-xs leading-tight text-gray-700">
									<span class="font-medium text-gray-500">Instruction:</span>
									<span class="ml-1">{candidate.instruction}</span>
								</div>
								<!-- 1:1 aspect ratio container for consistent grid layout -->
								<!-- 일관된 그리드 레이아웃을 위한 1:1 비율 컨테이너 -->
								<div class="aspect-square">
									{#if $animationConfig.candidateAnimationMode && candidate.states && candidate.states.length > 1}
										<MapAnimation
											states={candidate.states}
											agentPositions={candidate.agentPositions}
											showBorders={true}
											editMode={false}
											showControls={true}
											interval={$animationConfig.candidateAnimationInterval}
											autoPlay={false}
										/>
									{:else}
										<Grid
											gridMap={candidate.map}
											showBorders={true}
											editMode={false}
											agentPos={candidate.agentPositions?.at(-1) ?? null}
										/>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Current Selected Map (Right Half) -->
	<div class="flex min-h-0 flex-col gap-2 p-4">
		<!-- Fixed Title Area - Never shrinks -->
		<div class="flex-shrink-0">
			<h2 class="text-xl font-bold text-gray-800">Current Selected Map</h2>
			<p class="text-sm text-gray-600">
				{selectedCandidate
					? 'The currently selected map.'
					: 'No map selected. Select a candidate from the left or generate a new one.'}
			</p>
		</div>

		<!-- Main display area for the map -->
		{#if $mapState}
			<div class="flex min-h-0 flex-1 flex-col gap-2">
				<!-- Instruction display area - Fixed height h-10 -->
				{#if selectedCandidate && selectedCandidate.instruction}
					{@const sedangAnimasi = isPlayingSelectionAnimation}
					<div
						class="flex h-10 flex-shrink-0 items-center rounded-md border-l-4 px-3 text-xs {sedangAnimasi
							? 'border-blue-400 bg-blue-50 text-blue-700'
							: 'border-gray-400 bg-gray-50 text-gray-800'}"
					>
						<div class="flex items-center gap-2">
							<span class="font-medium">
								{sedangAnimasi ? 'Applying for:' : 'Current Instruction:'}
							</span>
							<span>{selectedCandidate.instruction}</span>
						</div>
					</div>
				{:else}
					<!-- instruction이 없으면 공간만 차지 -->
					<div class="h-10 flex-shrink-0"></div>
				{/if}

				<!-- Grid display area - Centered and aspect-square -->
				<div
					class="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-1"
					bind:clientWidth={gridDisplayContainerWidth}
					bind:clientHeight={gridDisplayContainerHeight}
				>
					{#if commonSize > 0 && $mapState}
						<div style="width: {commonSize}px; height: {commonSize}px;">
							<Grid
								gridMap={$mapState}
								showBorders={true}
								class="h-full w-full"
								editMode={!isPlayingSelectionAnimation}
								agentPos={currentAnimationAgentPos || agentPosForDisplayIfDataMissing}
							/>
						</div>
					{:else if $mapState}
						<div class="flex h-full w-full items-center justify-center text-xs text-gray-400">
							Map display area is too small.
						</div>
					{/if}
				</div>

				<!-- Simple Progress Bar Area -->
				{#if isPlayingSelectionAnimation && selectionAnimationStates.length > 1}
					<div class="flex-shrink-0 py-2">
						<SimpleProgressBar
							currentFrameIndex={currentAnimationFrameIndex}
							totalFrames={selectionAnimationStates.length}
						/>
					</div>
				{:else}
					<!-- Maintain consistent height when progress bar is not shown. Total height = 16px (py-2) + 16px (h-4 of progressbar) = 32px = h-8 -->
					<div class="h-8 flex-shrink-0"></div>
				{/if}
			</div>
		{:else}
			<!-- Empty state when no map is selected, maintaining layout structure -->
			<div class="flex min-h-0 flex-1 flex-col gap-2">
				<div class="h-10 flex-shrink-0"></div>
				<div class="flex min-h-0 flex-1 items-center justify-center">
					<div class="text-center text-gray-500">
						<p class="text-lg font-medium">No map selected</p>
						<p class="mt-2 text-sm">Select a candidate from the left or generate a new map.</p>
					</div>
				</div>
				<!-- Placeholder for progress bar area in empty state to maintain layout consistency -->
				<div class="h-8 flex-shrink-0"></div>
			</div>
		{/if}
	</div>
</div>
