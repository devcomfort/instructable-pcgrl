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
import { derived } from "svelte/store";
import { responseHistory } from "../chat/response-history";

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
export const mapCandidates = derived(
	responseHistory,
	($responseHistory): GridMap[] => {
		const latestResponse = $responseHistory.at(-1);

		if (!latestResponse) {
			return []; // 기록이 없으면 빈 배열 반환
		}

		// ResponseFormat 객체에서 "response" 키를 제외한 나머지 키들이 에피소드 데이터임
		const episodeKeys = Object.keys(latestResponse).filter(
			(key) => key !== "response",
		);

		if (episodeKeys.length === 0) {
			return []; // 에피소드가 없으면 빈 배열 반환
		}

		const candidates: GridMap[] = [];
		for (const key of episodeKeys) {
			const episodeData = latestResponse[key];
			// episodeData가 실제 EpisodeData 타입인지, state 배열이 있는지, 비어있지 않은지 확인
			if (
				episodeData &&
				typeof episodeData === "object" &&
				"state" in episodeData &&
				Array.isArray(episodeData.state) &&
				episodeData.state.length > 0
			) {
				const lastState = episodeData.state.at(-1);
				if (lastState) {
					// lastState가 undefined가 아닌지 확인
					candidates.push(lastState);
				}
			}
		}

		return candidates;
	},
);
