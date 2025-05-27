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
import { mapState } from "./map-state";

/**
 * Type representing a map candidate with its associated instruction
 */
export type MapCandidate = {
	map: GridMap;
	instruction: string;
	episodeId: string;
	states: GridMap[]; // 전체 state 배열 (애니메이션용)
};

/**
 * Derived store containing an array of MapCandidate objects
 * Each candidate includes the GridMap and its associated instruction
 *
 * @example
 * ```typescript
 * // Subscribe to changes
 * mapCandidates.subscribe(candidates => {
 *   console.log('Available maps:', candidates.length);
 *   candidates.forEach(candidate => {
 *     console.log('Map instruction:', candidate.instruction);
 *     console.log('Animation frames:', candidate.states.length);
 *   });
 * });
 * ```
 *
 * ---
 *
 * GridMap 후보들과 해당 지시사항을 함께 담고 있는 파생 스토어
 */
export const mapCandidates = derived(
	responseHistory,
	($responseHistory): MapCandidate[] => {
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

		const candidates: MapCandidate[] = [];
		for (const key of episodeKeys) {
			const episodeData = latestResponse[key];

			// episodeData가 실제 EpisodeData 타입인지, state 배열이 있는지, 비어있지 않은지 확인
			if (
				episodeData &&
				typeof episodeData === "object" &&
				"state" in episodeData &&
				"instruction" in episodeData &&
				Array.isArray(episodeData.state) &&
				episodeData.state.length > 0 &&
				typeof episodeData.instruction === "string"
			) {
				const lastState = episodeData.state.at(-1);
				if (lastState) {
					// lastState가 undefined가 아닌지 확인
					candidates.push({
						map: lastState,
						instruction: episodeData.instruction,
						episodeId: key,
						states: episodeData.state, // 전체 state 배열 추가
					});
				}
			}
		}

		return candidates;
	},
);

/**
 * Derived store that provides the instruction for the currently selected map
 * Returns the instruction if the current mapState matches any candidate,
 * otherwise returns null
 *
 * ---
 *
 * 현재 선택된 맵의 instruction을 제공하는 파생 스토어
 * 현재 mapState가 후보 중 하나와 일치하면 해당 instruction을 반환하고,
 * 그렇지 않으면 null을 반환합니다
 */
export const currentMapInstruction = derived(
	[mapCandidates, mapState],
	([$mapCandidates, $mapState]): string | null => {
		if (!$mapState || $mapCandidates.length === 0) {
			return null;
		}

		// Find a candidate whose map matches the current mapState
		// GridMap을 JSON 문자열로 비교하여 일치하는 후보를 찾습니다
		const currentMapJson = JSON.stringify($mapState);
		const matchingCandidate = $mapCandidates.find(
			(candidate) => JSON.stringify(candidate.map) === currentMapJson
		);

		return matchingCandidate?.instruction || null;
	}
);
