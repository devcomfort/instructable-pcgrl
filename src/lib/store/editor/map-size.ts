import { writable } from "svelte/store";
import { DEFAULT_MAP_SIZE, DEFAULT_MAP_PIXEL_SIZE } from "../../core/defaults";
import type { MapSizeProfile } from "$lib/core/grid-map/map-size-profile-type";

/**
 * @store mapSize
 * @description A Svelte writable store that holds the map's dimensions.
 * This includes the grid size (number of rows and columns) and
 * the pixel size (height and width in pixels) for display.
 * It is initialized with `DEFAULT_MAP_SIZE` for the grid dimensions
 * and `[BOARD_SIZE_PX, BOARD_SIZE_PX]` for the pixel dimensions.
 *
 * @see {@link MapSize}
 * @see {@link DEFAULT_MAP_SIZE}
 * @see {@link BOARD_SIZE_PX}
 */
export const mapSize = writable<MapSizeProfile>({
	gridSize: DEFAULT_MAP_SIZE,
	/**
	 * TODO: pixelSize currently unused - letting CSS handle responsive sizing instead
	 * 
	 * Turns out explicit pixel dimensions fight with responsive design.
	 * Better to let containers auto-size based on viewport/parent constraints.
	 * 
	 * Keep this field for when we need precise control (e.g., canvas rendering,
	 * fixed-size exports, or when responsive becomes a limitation).
	 * 
	 * ---
	 * 
	 * pixelSize 현재 미사용 - CSS가 반응형 크기 조정하도록 위임
	 * 
	 * 명시적 픽셀 차원이 반응형 디자인과 충돌하는 것으로 판명.
	 * 뷰포트/부모 제약에 따라 컨테이너가 자동 크기 조정되도록 하는 게 나음.
	 * 
	 * 정밀한 제어가 필요할 때를 위해 필드 유지 (예: 캔버스 렌더링,
	 * 고정 크기 내보내기, 반응형이 제약이 될 때).
	 */
	pixelSize: DEFAULT_MAP_PIXEL_SIZE,
});
