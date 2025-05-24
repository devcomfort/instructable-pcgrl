<script lang="ts">
	import GridCell from './GridCell.svelte';
	import { Tileset } from '$lib/core/grid-map/tileset-type';
	import type { ClassValue } from 'svelte/elements';
	import type { GridMap } from '$lib/core/grid-map/map-type';
	import type { GridMapShape, TilesetValue } from '$lib/core/grid-map';
	import { showBorders as showBorders_ } from '$lib/store/editor';

	const {
		gridMap = null,
		mapSize = null,
		showBorders = $showBorders_,
		// TODO: userClass가 사용될 때 tw-merge를 통해 개선할 필요가 있음
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
		 * Additional CSS classes to apply to the grid container.
		 *
		 * ---
		 *
		 * 그리드 컨테이너에 적용할 추가 CSS 클래스.
		 */
		class?: ClassValue;
	}>();

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

	const completeGrid = $derived(createCompleteGrid());
	const gridRows = $derived(completeGrid.length);
	const gridCols = $derived(completeGrid[0]?.length || 0);

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
		class="grid select-none gap-0 border-2 border-gray-300 bg-gray-50 {userClass}"
		style="--gtc: {gridTemplateColumnsValue}; --gtr: {gridTemplateRowsValue}; --ar: {aspectRatioValue}; grid-template-columns: var(--gtc); grid-template-rows: var(--gtr); aspect-ratio: var(--ar);"
		role="grid"
		aria-label="Game grid with {gridRows} rows and {gridCols} columns"
	>
		{#each completeGrid.flat() as tileValue, index (index)}
			{@const rowIndex = Math.floor(index / gridCols)}
			{@const colIndex = index % gridCols}
			<GridCell pos={{ u: colIndex, v: rowIndex }} tileName={tileValue} />
		{/each}
	</div>
{:else}
	<div
		class="flex min-h-[200px] min-w-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-100 {userClass}"
		role="status"
		aria-label="Empty grid"
	>
		<div class="p-5 text-center italic text-gray-600">
			<span>No grid data available or invalid size</span>
		</div>
	</div>
{/if}
