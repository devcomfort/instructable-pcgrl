import { writable } from "svelte/store";

/**
 * Store for controlling whether to show borders around grid cells.
 * 
 * When true, borders will be displayed around each grid cell to help
 * visualize the grid structure during editing.
 * 
 * ---
 * 
 * 그리드 셀 주변에 경계선을 표시할지 제어하는 스토어.
 * 
 * true일 때 편집 중 그리드 구조를 시각화하는 데 도움이 되도록
 * 각 그리드 셀 주변에 경계선이 표시됩니다.
 */
export const showBorders = writable(false);