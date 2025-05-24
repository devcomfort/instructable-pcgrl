import { derived } from "svelte/store";
import type { GridMapShape } from "../../core/grid-map";
import { mapSize } from "../editor/map-size";

/**
 * @store defaultPlayerPos
 * @deprecated This store is currently not used in the project and may be removed in future versions.
 * If you need to calculate the player's default starting position in the future, you can use this implementation
 * as a reference or restore it from version control.
 * @description A Svelte derived store that calculates the player's default starting position.
 * This position is typically set to the center coordinates ([row, column]) of the game map.
 * It is derived from the `gridSize` (grid dimensions) provided by the `mapSize` store.
 *
 * Calculation Logic:
 * It takes the `gridSize` (total number of rows and columns of the map, e.g., `[10, 20]`).
 * For each dimension (rows, columns), it divides the size by 2 and then rounds the result
 * to the nearest integer using {@link Math.round}.
 * This determines the approximate center coordinates `[centerRow, centerCol]` of the map.
 *
 * Example:
 * - If `mapSize.gridSize` is `[10, 20]` (10 rows, 20 columns),
 *   `defaultPlayerPos` will be `[Math.round(10/2), Math.round(20/2)]`, resulting in `[5, 10]`.
 * - If `mapSize.gridSize` is `[7, 15]` (7 rows, 15 columns),
 *   `defaultPlayerPos` will be `[Math.round(7/2), Math.round(15/2)]`, i.e., `[Math.round(3.5), Math.round(7.5)]`, resulting in `[4, 8]`.
 *
 * Type Information:
 * - The `gridSize` property of the `mapSize` store is of type {@link GridMapShape}, which is a tuple of `[number, number]`.
 * - The operation `gridSize.map((size) => Math.round(size / 2))` applies the function to each element
 *   of `gridSize` (number of rows, number of columns), creating a new `[number, number]` array
 *   (e.g., `[calculatedCenterRow, calculatedCenterColumn]`).
 * - This resulting array matches the structure of {@link GridMapShape}, so the type assertion `as GridMapShape`
 *   is used to explicitly specify its type. This assures the TypeScript compiler that the value's structure
 *   conforms to `GridMapShape`.
 *
 * @derived_from mapSize - Depends on the `gridSize` value from the `mapSize` store and updates dynamically.
 * @returns {GridMapShape} The calculated default starting position of the player as `[row, column]`.
 *
 * ---
 *
 * 현재 프로젝트에서 사용되지 않는 스토어입니다. 추후 플레이어의 기본 시작 위치 계산이 필요하다면
 * 이 구현을 참고하거나 버전 관리에서 복원하여 사용하세요.
 *
 * 플레이어의 기본 시작 위치를 계산하는 Svelte 파생 스토어입니다.
 * 위치는 일반적으로 게임 맵의 중앙 좌표([행, 열])로 설정됩니다.
 * `mapSize` 스토어에서 제공하는 `gridSize`(그리드 크기)로부터 파생됩니다.
 *
 * 계산 로직:
 * 맵의 총 행과 열 수를 나타내는 `gridSize`(예: `[10, 20]`)를 가져옵니다.
 * 각 차원(행, 열)에 대해 크기를 2로 나누고 {@link Math.round}를 사용하여
 * 가장 가까운 정수로 반올림합니다.
 * 이를 통해 맵의 대략적인 중앙 좌표 `[중앙행, 중앙열]`을 결정합니다.
 */
export const defaultPlayerPos = derived(mapSize, ({ gridSize }) => {
	// gridSize is of type GridMapShape, representing [total rows, total columns] (e.g., [10, 20]).
	// The .map() operation is used to divide each dimension (rows, columns) by 2,
	// and Math.round() rounds it to the nearest integer,
	// creating a new [number, number] array for the map's center (e.g., [5, 10]).
	// This resulting array matches the structure of GridMapShape ([number, number] tuple),
	// hence the type assertion (as GridMapShape).

	// ---

	// gridSize는 GridMapShape 타입으로 [총 행 수, 총 열 수]를 나타냅니다 (예: [10, 20]).
	// .map() 연산을 사용하여 각 차원(행, 열)을 2로 나누고,
	// Math.round()로 가장 가까운 정수로 반올림하여
	// 맵의 중앙에 대한 새로운 [number, number] 배열을 생성합니다 (예: [5, 10]).
	// 이 결과 배열은 GridMapShape([number, number] 튜플)의 구조와 일치하므로
	// 타입 단언(as GridMapShape)을 사용합니다.
	return gridSize.map((size) => Math.round(size / 2)) as GridMapShape;
});
