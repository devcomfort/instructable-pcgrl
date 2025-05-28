<script lang="ts">
	import GridCell from './GridCell.svelte';
	import { Tileset } from '$lib/core/grid-map/tileset-type';
	import type { ClassValue } from 'svelte/elements';
	import type { GridMap } from '$lib/core/grid-map/map-type';
	import type { GridMapShape, TilesetValue } from '$lib/core/grid-map';
	import { showBorders as showBorders_ } from '$lib/store/editor';
	import { selectedTile } from '$lib/store/editor/selected-tile';
	import { mapState } from '$lib/store/editor/map-state';
	import { activeTab } from '$lib/store/editor/active-tab';
	import { twMerge } from 'tailwind-merge';

	const {
		gridMap = null,
		mapSize = null,
		showBorders = $showBorders_,
		editMode = false,
		agentPos = null,
		class: userClass = ''
	} = $props<{
		/**
		 * The grid map data to render.
		 * A 2D array where each number represents a tile type.
		 *
		 * ---
		 *
		 * 렌더링할 그리드 맵 데이터.
		 * 각 숫자가 타일 타입을 나타내는 2차원 배열.
		 */
		gridMap?: GridMap | null;

		/**
		 * The size of the grid map.
		 *
		 * ---
		 *
		 * 그리드 맵의 크기.
		 */
		mapSize?: GridMapShape | null;

		/**
		 * Whether to show borders around the grid.
		 * When true, adds border tiles around the actual grid content.
		 *
		 * ---
		 *
		 * 그리드 주변에 경계선을 표시할지 여부.
		 * true일 때 실제 그리드 내용 주위에 경계 타일을 추가함.
		 */
		showBorders?: boolean;

		/**
		 * Whether to enable edit mode for the grid.
		 * When true, allows clicking and dragging to modify tiles.
		 *
		 * ---
		 *
		 * 그리드의 편집 모드를 활성화할지 여부.
		 * true일 때 클릭과 드래그로 타일을 수정할 수 있음.
		 */
		editMode?: boolean;

		/**
		 * Agent position in the grid.
		 *
		 * ---
		 *
		 * 그리드에서의 에이전트 위치.
		 */
		agentPos?: [number, number] | null;

		/**
		 * Additional CSS classes to apply to the grid container.
		 *
		 * ---
		 *
		 * 그리드 컨테이너에 적용할 추가 CSS 클래스.
		 */
		class?: ClassValue;
	}>();

	// Mouse drag state for continuous drawing
	let isMouseDown = $state(false);

	/**
	 * Create the complete grid including borders if enabled.
	 *
	 * ---
	 *
	 * 경계가 활성화된 경우 경계를 포함하여 완전한 그리드를 생성합니다.
	 */
	function createCompleteGrid(): TilesetValue[][] {
		if (!gridMap || gridMap.length === 0) {
			if (mapSize) {
				const [rows, cols] = mapSize;
				if (showBorders) {
					const borderRow = Array(cols + 2).fill(Tileset.BORDER);
					const middleRows = Array(rows)
						.fill(null)
						.map(() => [Tileset.BORDER, ...Array(cols).fill(Tileset.EMPTY), Tileset.BORDER]);
					return [borderRow, ...middleRows, borderRow];
				}
				// showBorders가 false이고 mapSize만 있는 경우
				return Array(rows)
					.fill(null)
					.map(() => Array(cols).fill(Tileset.EMPTY));
			}
			return []; // gridMap과 mapSize 둘 다 없으면 빈 배열
		}

		// gridMap이 유효한 경우
		if (!showBorders) {
			return gridMap; // showBorders가 false면 원본 맵 반환
		}

		// gridMap이 유효하고 showBorders가 true인 경우
		const rows = gridMap.length;
		const cols = gridMap[0]?.length || 0;
		const completeGridData: TilesetValue[][] = [
			Array(cols + 2).fill(Tileset.BORDER),
			...gridMap.map((row: TilesetValue[]) => [Tileset.BORDER, ...row, Tileset.BORDER]),
			Array(cols + 2).fill(Tileset.BORDER)
		];
		return completeGridData;
	}

	/**
	 * Handle cell interaction for editing mode.
	 * Updates the map state with the selected tile if edit mode is enabled.
	 * Now also checks if the Edit tab is currently active.
	 *
	 * Edit 모드일 때 셀 상호작용을 처리합니다.
	 * 선택된 타일로 맵 상태를 업데이트하며, Edit 탭이 현재 활성화되어 있는지도 확인합니다.
	 */
	function handleCellInteraction(gridRowIndex: number, gridColIndex: number) {
		// Check if edit mode is enabled, selected tile exists, and Edit tab is active
		if (!editMode || !$selectedTile || $activeTab !== 'edit') return;

		// Calculate actual map coordinates, considering borders
		let mapRowIndex = gridRowIndex;
		let mapColIndex = gridColIndex;

		if (showBorders) {
			// If borders are shown, subtract 1 from both coordinates
			// Skip if clicking on border tiles
			if (
				gridRowIndex === 0 ||
				gridRowIndex === gridRows - 1 ||
				gridColIndex === 0 ||
				gridColIndex === gridCols - 1
			) {
				return; // Don't edit border tiles
			}
			mapRowIndex = gridRowIndex - 1;
			mapColIndex = gridColIndex - 1;
		}

		// Update the map state
		mapState.update((currentMap) => {
			const newMap = currentMap.map((row) => [...row]);

			if (
				mapRowIndex >= 0 &&
				mapRowIndex < newMap.length &&
				mapColIndex >= 0 &&
				mapColIndex < newMap[0].length
			) {
				newMap[mapRowIndex][mapColIndex] = Tileset[$selectedTile];
			}

			return newMap;
		});
	}

	/**
	 * Handle mouse down event on a cell
	 */
	function handleMouseDown(gridRowIndex: number, gridColIndex: number) {
		// Check if edit mode is enabled and Edit tab is active
		if (!editMode || $activeTab !== 'edit') return;
		isMouseDown = true;
		handleCellInteraction(gridRowIndex, gridColIndex);
	}

	/**
	 * Handle mouse enter event on a cell (for drag painting)
	 */
	function handleMouseEnter(gridRowIndex: number, gridColIndex: number) {
		// Check if edit mode is enabled, mouse is down, and Edit tab is active
		if (!editMode || !isMouseDown || $activeTab !== 'edit') return;
		handleCellInteraction(gridRowIndex, gridColIndex);
	}

	/**
	 * Handle mouse up event to stop drawing
	 */
	function handleMouseUp() {
		isMouseDown = false;
	}

	const completeGrid = $derived(createCompleteGrid());
	const gridRows = $derived(completeGrid.length);
	const gridCols = $derived(completeGrid[0]?.length || 0);

	// 디버깅: agentPos prop 변경 감지 (개발 환경에서만)
	$effect(() => {
		if (import.meta.env.DEV) {
			if (agentPos) {
				// console.log('[Grid] Agent position prop updated:', agentPos, `Grid size: ${gridRows}x${gridCols}`);
			}
		}
	});

	/**
	 * Check if a grid cell is at the agent position.
	 * Takes grid indices (which might include border cells) as input.
	 */
	function isAgentPosition(gridRowIdx: number, gridColIdx: number): boolean {
		if (!agentPos) return false;

		const [agentMapRow, agentMapCol] = agentPos; // agentPos는 실제 맵 좌표

		// Convert grid indices to map indices if borders are shown
		const mapRow = showBorders ? gridRowIdx - 1 : gridRowIdx;
		const mapCol = showBorders ? gridColIdx - 1 : gridColIdx;

		// Borders themselves cannot be agent positions if showBorders is true
		// Also, ensure the converted map coordinates are valid for the original map dimensions
		if (showBorders) {
			if (
				gridRowIdx === 0 ||
				gridRowIdx === gridRows - 1 ||
				gridColIdx === 0 ||
				gridColIdx === gridCols - 1
			) {
				return false; // Click on border itself
			}
			// Ensure agentMapRow/Col are valid for the non-bordered map
			if (
				agentMapRow < 0 ||
				agentMapRow >= gridRows - 2 ||
				agentMapCol < 0 ||
				agentMapCol >= gridCols - 2
			) {
				// This case should ideally not happen if agentPos is always correct for the *original* map
				// but as a safeguard:
				if (import.meta.env.DEV) {
					// console.warn("[Grid] agentPos seems to be outside the actual map boundaries when considering borders.", agentPos, `map: ${(gridRows-2)}x${(gridCols-2)}`);
				}
				return false;
			}
		} else {
			// No borders, agentMapRow/Col must be valid for the grid itself
			if (
				agentMapRow < 0 ||
				agentMapRow >= gridRows ||
				agentMapCol < 0 ||
				agentMapCol >= gridCols
			) {
				if (import.meta.env.DEV) {
					// console.warn("[Grid] agentPos seems to be outside the grid boundaries (no borders).", agentPos, `grid: ${gridRows}x${gridCols}`);
				}
				return false;
			}
		}

		const isAgent = mapRow === agentMapRow && mapCol === agentMapCol;
		return isAgent;
	}

	/**
	 * Value for the CSS grid-template-columns property.
	 * Defines the number of grid columns and the size of each column (e.g., "repeat(10, minmax(0, 1fr))").
	 * ---
	 * CSS grid-template-columns 속성에 사용될 값입니다.
	 * 그리드 열의 수와 각 열의 크기를 정의합니다 (예: "repeat(10, minmax(0, 1fr))").
	 */
	const gridTemplateColumnsValue = $derived(`repeat(${gridCols}, minmax(0, 1fr))`);

	/**
	 * Value for the CSS grid-template-rows property.
	 * Defines the number of grid rows and the size of each row (e.g., "repeat(8, minmax(0, 1fr))").
	 * ---
	 * CSS grid-template-rows 속성에 사용될 값입니다.
	 * 그리드 행의 수와 각 행의 크기를 정의합니다 (예: "repeat(8, minmax(0, 1fr))").
	 */
	const gridTemplateRowsValue = $derived(`repeat(${gridRows}, minmax(0, 1fr))`);

	/**
	 * Value for the CSS aspect-ratio property.
	 * Defines the aspect ratio of the grid (e.g., "10 / 8").
	 * ---
	 * CSS aspect-ratio 속성에 사용될 값입니다.
	 * 그리드의 가로세로 비율을 정의합니다 (예: "10 / 8").
	 */
	const aspectRatioValue = $derived(
		gridCols > 0 && gridRows > 0 ? `${gridCols} / ${gridRows}` : 'auto'
	);
</script>

{#if gridRows > 0 && gridCols > 0}
	<div
		class={twMerge('grid gap-0 border-2 border-gray-300 bg-gray-50 select-none', userClass)}
		style="--gtc: {gridTemplateColumnsValue}; --gtr: {gridTemplateRowsValue}; --ar: {aspectRatioValue}; grid-template-columns: var(--gtc); grid-template-rows: var(--gtr); aspect-ratio: var(--ar);"
		role="grid"
		tabindex={editMode ? 0 : -1}
		aria-label="Game grid with {gridRows} rows and {gridCols} columns"
		onmouseup={handleMouseUp}
		onmouseleave={() => (isMouseDown = false)}
	>
		{#each completeGrid.flat() as tileValue, index (index)}
			{@const rowIndex = Math.floor(index / gridCols)}
			{@const colIndex = index % gridCols}
			{@const isAgentCell = isAgentPosition(rowIndex, colIndex)}
			<GridCell
				pos={{ u: colIndex, v: rowIndex }}
				tileName={tileValue}
				onmousedown={() => handleMouseDown(rowIndex, colIndex)}
				onmouseenter={() => handleMouseEnter(rowIndex, colIndex)}
				onmouseup={handleMouseUp}
				class={twMerge(
					editMode ? 'cursor-pointer' : '',
					isAgentCell ? 'border-2 border-white shadow-lg' : '' // Tailwind CSS로 2px 흰색 테두리 및 그림자 적용
				)}
			/>
		{/each}
	</div>
{:else}
	<div
		class="flex min-h-[200px] min-w-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-100 {userClass}"
		role="status"
		aria-label="Empty grid"
	>
		<div class="p-5 text-center text-gray-600 italic">
			<span>No grid data available or invalid size</span>
		</div>
	</div>
{/if}
