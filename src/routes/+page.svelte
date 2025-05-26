<script lang="ts">
	import Grid from '$lib/components/GridMap/Grid.svelte';
	import { mapState } from '$lib/store/editor';
	import { mapCandidates } from '$lib/store/editor/map-candidates';
	import type { GridMap } from '$lib/core/grid-map';

	/**
	 * Handle clicking on a map candidate
	 * Updates the current mapState with the selected candidate
	 *
	 * ---
	 *
	 * 맵 후보 클릭 처리
	 * 선택된 후보로 현재 mapState를 업데이트합니다
	 */
	function handleCandidateClick(candidate: GridMap) {
		mapState.set(candidate);
		console.log('[Page] Map candidate selected and mapState updated');
	}
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
					{#each $mapCandidates as candidate, index (index)}
						<div
							class="cursor-pointer rounded-lg border-2 border-gray-200 p-2 transition-all hover:border-blue-500 hover:shadow-md"
							onclick={() => handleCandidateClick(candidate)}
							role="button"
							tabindex="0"
							aria-label="Select map candidate {index + 1}"
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
							<!-- 1:1 aspect ratio container for consistent grid layout -->
							<!-- 일관된 그리드 레이아웃을 위한 1:1 비율 컨테이너 -->
							<div class="aspect-square">
								<Grid gridMap={candidate} showBorders={true} />
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Current Map Section (Right Half) -->
	<!-- 현재 맵 영역 (우측 절반) - 스크롤 없이 전체 맵 표시 -->
	<div class="flex min-h-0 flex-col gap-4 p-4">
		<!-- Fixed Title Area - Never shrinks -->
		<!-- 고정 제목 영역 - 절대 축소되지 않음 -->
		<div class="flex-shrink-0">
			<h2 class="text-xl font-bold text-gray-800">Current Selected Map</h2>
			<p class="text-sm text-gray-600">The currently active map state</p>
		</div>

		<!-- Full Map Display Area - No scrolling, shows entire map -->
		<!-- 전체 맵 표시 영역 - 스크롤 없이 전체 맵 표시 -->
		<div class="min-h-0 flex-1 overflow-hidden text-center">
			{#if $mapState}
				<!-- Map container that fills available space -->
				<!-- 사용 가능한 공간을 채우는 맵 컨테이너 -->
				<div class="h-full w-full">
					<Grid gridMap={$mapState} showBorders={true} />
				</div>
			{:else}
				<!-- Empty state when no map is selected -->
				<!-- 선택된 맵이 없을 때의 빈 상태 -->
				<div class="flex h-full items-center justify-center">
					<div class="text-gray-500">
						<p class="text-lg font-medium">No map selected</p>
						<p class="mt-2 text-sm">Select a candidate from left or generate new maps</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
