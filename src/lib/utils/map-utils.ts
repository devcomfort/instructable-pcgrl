import { get } from "svelte/store";
import type { GridMap, GridMapShape } from "$lib/core";
import { tileGenerationProbabilities, getRandomTile } from "$lib/utils/env";

/**
 * Generates a random grid map based on the current tile generation probabilities.
 * 현재 타일 생성 확률에 따라 랜덤 그리드 맵을 생성합니다.
 *
 * @param gridSize - The dimensions [rows, cols] of the map to generate.
 * @returns A new GridMap filled with random tiles.
 */
export function generateRandomMap(gridSize: GridMapShape): GridMap {
	const [rows, cols] = gridSize;
	const currentTileProbs = get(tileGenerationProbabilities);

	const randomMap = Array.from({ length: rows }, () =>
		Array.from({ length: cols }, () => getRandomTile(currentTileProbs)),
	);

	return randomMap;
}
