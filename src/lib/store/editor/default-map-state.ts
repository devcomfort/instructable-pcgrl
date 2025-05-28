import { derived } from "svelte/store";
import { Tileset, type GridMap } from "$lib/core";
import { mapSize } from "./map-size";

/**
 * @store defaultMapState
 * @description A derived Svelte store that creates a default empty map state based on the current map size.
 * This store automatically recalculates whenever the map size changes, providing a clean slate
 * for map generation or reset operations.
 *
 * The generated map is a 2D grid filled entirely with EMPTY tiles, representing a blank canvas
 * for procedural generation algorithms or manual map editing.
 *
 * @returns {GridMap} A 2D array where each cell contains `Tileset.EMPTY`
 *
 * @example
 * ```typescript
 * // If mapSize.gridSize is [10, 15], this creates:
 * // A 10x15 grid where every cell equals Tileset.EMPTY
 * $defaultMapState // => [[1,1,1,...], [1,1,1,...], ...]
 * ```
 *
 * ---
 *
 * 현재 맵 크기를 기반으로 기본 빈 맵 상태를 생성하는 파생 Svelte 스토어.
 * 맵 크기가 변경될 때마다 자동으로 재계산되어 맵 생성이나 리셋 작업을 위한
 * 깨끗한 상태를 제공합니다.
 *
 * 생성된 맵은 모두 EMPTY 타일로 채워진 2D 그리드로, 절차적 생성 알고리즘이나
 * 수동 맵 편집을 위한 빈 캔버스를 나타냅니다.
 */
export const defaultMapState = derived<typeof mapSize, GridMap>(
	mapSize,
	({ gridSize }) => {
		const [rows, cols] = gridSize;

		// 기본적으로 모든 타일을 EMPTY로 채움
		const newMap = Array.from({ length: rows }, () =>
			Array(cols).fill(Tileset.EMPTY),
		);

		return newMap;
	},
);
