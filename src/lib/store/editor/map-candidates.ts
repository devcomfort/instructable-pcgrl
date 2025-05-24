/**
 * Map Candidates Store
 * 
 * This store manages an array of GridMap instances that represent
 * candidate maps available for selection in the map editor.
 * These candidates are typically used for:
 * - Displaying available map options to users
 * - Allowing users to select from pre-generated or template maps
 * - Managing map selection state in the editor interface
 * 
 * The store is reactive and will automatically update any components
 * that subscribe to it when the candidates array changes.
 * 
 * ---
 * 
 * 맵 후보 목록을 관리하는 스토어입니다.
 * 맵 에디터에서 선택 가능한 GridMap 인스턴스들의 배열을 저장하며,
 * 사용자가 선택할 수 있는 맵 옵션들을 관리하는 용도로 사용됩니다.
 */

import type { GridMap } from "$lib/core/grid-map";
import { writable } from "svelte/store";

/**
 * Writable store containing an array of GridMap candidates
 * 
 * @example
 * ```typescript
 * // Subscribe to changes
 * mapCandidates.subscribe(candidates => {
 *   console.log('Available maps:', candidates.length);
 * });
 * 
 * // Update candidates
 * mapCandidates.set(newMapArray);
 * 
 * // Add a new candidate
 * mapCandidates.update(current => [...current, newMap]);
 * ```
 * 
 * ---
 * 
 * GridMap 후보들의 배열을 담고 있는 반응형 스토어
 */
export const mapCandidates = writable<GridMap[]>([]);