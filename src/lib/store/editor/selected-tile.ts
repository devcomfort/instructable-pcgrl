import type { TilesetKey } from "$lib/core";
import { writable } from "svelte/store";

/**
 * @store selectedTile
 * @description A Svelte writable store that manages the currently selected tile type.
 * This store holds the tile type that the user has selected from the tile palette
 * in the Edit component, which determines what type of tile will be placed
 * when editing the grid map.
 *
 * 사용자가 Edit 컴포넌트의 타일 팔레트에서 선택한 타일 타입을 관리하는 스토어입니다.
 * 맵 편집 시 그리드 셀에 배치될 타일 타입을 결정합니다.
 *
 * The initial value is undefined, and it gets updated to the corresponding
 * TilesetKey value when the user selects a tile from the palette.
 *
 * 초기값은 undefined이며, 사용자가 팔레트에서 타일을 선택하면 해당 TilesetKey 값으로 업데이트됩니다.
 *
 * @see {@link TilesetKey} - Available tile types / 사용 가능한 타일 타입들
 * @see {@link Edit} - Component that uses this store / 이 스토어를 사용하는 타일 선택 컴포넌트
 *
 * @example
 * ```typescript
 * import { selectedTile } from '$lib/store/editor/selected-tile';
 *
 * // Select a tile / 타일 선택
 * selectedTile.set('WALL');
 *
 * // Subscribe to selected tile changes / 선택된 타일 변경 구독
 * selectedTile.subscribe(tile => {
 *   console.log('Selected tile:', tile);
 * });
 * ```
 */
export const selectedTile = writable<TilesetKey>(undefined);
