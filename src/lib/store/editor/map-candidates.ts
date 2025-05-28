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
import { derived, writable } from "svelte/store";
import { responseHistory } from "../chat/response-history";
import type { EpisodeData } from "$lib/core/inference/response-format"; // EpisodeData 타입 임포트

/**
 * Type representing a map candidate with its associated instruction
 */
export type MapCandidate = {
	map: GridMap;
	instruction: string;
	episodeId: string;
	states: GridMap[]; // 전체 state 배열 (애니메이션용)
	agentPositions: Array<[number, number]>; // 각 프레임에 해당하는 에이전트 위치들
};

/**
 * Buffer to store the original map state before AI modifications
 * This allows users to revert back to the original map
 *
 * ---
 *
 * AI 수정 전의 원본 맵 상태를 저장하는 버퍼
 * 사용자가 원본 맵으로 되돌릴 수 있도록 합니다
 */
export const mapBuffer = writable<GridMap | null>(null);

/**
 * Function to capture the current map state as the original
 * Call this before generating AI candidates
 *
 * ---
 *
 * 현재 맵 상태를 원본으로 캡처하는 함수
 * AI 후보 생성 전에 호출하세요
 */
export function captureOriginalMap(currentMap: GridMap) {
	// TODO: 데이터 복사 방식을 수정하는게 좋을 것 같음. (JSON 직렬화/역직렬화 방식은 생각보다 많은 자원을 소모함. 데이터 크기가 작아서 괜찮을 수도 있으니 검토 후 수정 여부 결정해야함)
	mapBuffer.set(JSON.parse(JSON.stringify(currentMap))); // Deep copy
}

/**
 * Derived store containing an array of MapCandidate objects from AI responses only
 * Each candidate includes the GridMap and its associated instruction
 * This does NOT include the original map - that should be added at display time
 *
 * @example
 * ```typescript
 * // Subscribe to changes
 * mapCandidates.subscribe(candidates => {
 *   console.log('Available AI maps:', candidates.length);
 *   candidates.forEach(candidate => {
 *     console.log('Map instruction:', candidate.instruction);
 *     console.log('Animation frames:', candidate.states.length);
 *     console.log('Agent positions:', candidate.agentPositions.length);
 *   });
 * });
 * ```
 *
 * ---
 *
 * AI 응답에서만 생성된 GridMap 후보들을 담고 있는 파생 스토어
 * 원본 맵은 포함되지 않으며, 표시할 때 별도로 추가해야 합니다
 */
export const mapCandidates = derived(
	[responseHistory],
	([$responseHistory]): MapCandidate[] => {
		const candidates: MapCandidate[] = [];

		const latestResponse = $responseHistory.at(-1);

		if (latestResponse) {
			const episodeKeys = Object.keys(latestResponse).filter(
				(key) => key !== "response",
			);

			for (const key of episodeKeys) {
				const episodeDataUntyped = latestResponse[key];

				// episodeData의 기본 구조 및 필수 필드 확인
				if (
					episodeDataUntyped &&
					typeof episodeDataUntyped === "object" &&
					"state" in episodeDataUntyped &&
					Array.isArray(episodeDataUntyped.state) &&
					episodeDataUntyped.state.length > 0 &&
					"instruction" in episodeDataUntyped &&
					typeof episodeDataUntyped.instruction === "string"
				) {
					// agent_pos 필드가 있고 배열인지 확인 (없거나 배열이 아니면 기본값 사용)
					let agentPositionsData: Array<[number, number]> = [];
					let isValidAgentPos = false;

					if (
						"agent_pos" in episodeDataUntyped &&
						Array.isArray(episodeDataUntyped.agent_pos)
					) {
						// EpisodeData 타입으로 간주하여 agent_pos에 접근
						const typedEpisodeData = episodeDataUntyped as EpisodeData;
						agentPositionsData = typedEpisodeData.agent_pos;

						// agent_pos 내부 데이터 구조 유효성 검사 (모든 요소가 [number, number] 형태인지)
						isValidAgentPos = agentPositionsData.every(
							(pos) =>
								Array.isArray(pos) &&
								pos.length === 2 &&
								pos.every((p) => typeof p === "number"),
						);

						if (!isValidAgentPos && import.meta.env.DEV) {
							console.warn(
								`[MapCandidates] Episode ${key}: Invalid agent_pos data structure inside array. Each element should be [number, number]. Received:`,
								agentPositionsData,
							);
						}
					}
					if (
						import.meta.env.DEV &&
						episodeDataUntyped &&
						typeof episodeDataUntyped === "object" &&
						!("agent_pos" in episodeDataUntyped)
					) {
						console.warn(
							`[MapCandidates] Episode ${key}: agent_pos field is missing. Defaulting to empty array.`,
						);
					} else if (
						import.meta.env.DEV &&
						episodeDataUntyped &&
						typeof episodeDataUntyped === "object" &&
						"agent_pos" in episodeDataUntyped &&
						!Array.isArray(episodeDataUntyped.agent_pos)
					) {
						console.warn(
							`[MapCandidates] Episode ${key}: agent_pos field is not an array. Defaulting to empty array. Received:`,
							episodeDataUntyped.agent_pos,
						);
					}

					const lastState = episodeDataUntyped.state.at(-1);
					if (lastState) {
						if (import.meta.env.DEV) {
							console.log(
								`[MapCandidates] Processing Episode ${key}: statesLength=${episodeDataUntyped.state.length}, agentPosLength=${agentPositionsData.length}, instruction="${episodeDataUntyped.instruction}", agent_pos_valid=${isValidAgentPos}`,
							);
						}
						candidates.push({
							map: lastState,
							instruction: episodeDataUntyped.instruction,
							episodeId: key,
							states: episodeDataUntyped.state,
							agentPositions: isValidAgentPos ? agentPositionsData : [], // 유효한 경우에만 할당, 아니면 빈 배열
						});
					}
				} else if (import.meta.env.DEV) {
					console.warn(
						`[MapCandidates] Episode ${key}: Missing critical fields (state or instruction) or invalid data type. Skipping. Data:`,
						episodeDataUntyped,
					);
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
	[mapCandidates],
	([$mapCandidates]): string | null => {
		if ($mapCandidates.length === 0) {
			return null;
		}

		// Find a candidate whose map matches the current mapState
		// GridMap을 JSON 문자열로 비교하여 일치하는 후보를 찾습니다
		const currentMapJson = JSON.stringify($mapCandidates[0].map);
		const matchingCandidate = $mapCandidates.find(
			(candidate) => JSON.stringify(candidate.map) === currentMapJson,
		);

		return matchingCandidate?.instruction || null;
	},
);
