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
Main page layout with horizontal split design
Left half displays map candidates, right half shows current selected map

---

가로로 나뉜 메인 페이지 레이아웃
좌측에는 맵 후보들을, 우측에는 현재 선택된 맵을 표시
-->
<div class="grid h-full grid-cols-2 gap-0">
	<!-- Map Candidates Section (Left Half) -->
	<div class="border-r-2 border-gray-300 p-4">
		<div class="mb-4">
			<h2 class="text-xl font-bold text-gray-800">Map Candidates</h2>
			<p class="text-sm text-gray-600">Click on a candidate to select it</p>
		</div>

		<div class="overflow-y-auto" style="height: calc(100% - 5rem);">
			{#if $mapCandidates.length === 0}
				<!-- Empty state message -->
				<div class="flex h-full items-center justify-center">
					<div class="text-center text-gray-500">
						<p class="text-lg font-medium">No candidates available yet</p>
						<p class="mt-2 text-sm">Use the chat interface to generate map candidates with AI</p>
					</div>
				</div>
			{:else}
				<!-- Candidates grid display -->
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
	<div class="p-4">
		<div class="mb-4">
			<h2 class="text-xl font-bold text-gray-800">Current Selected Map</h2>
			<p class="text-sm text-gray-600">The currently active map state</p>
		</div>

		<div class="text-center" style="height: calc(100% - 5rem);">
			{#if $mapState}
				<div class="h-full w-full">
					<Grid gridMap={$mapState} showBorders={true} />
				</div>
			{:else}
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
