<script lang="ts">
	import type { TilesetKey, TilesetValue } from '$lib/core/grid-map/tileset-type';
	import { Tileset, TileImage } from '$lib/core/grid-map/tileset-type';
	import type { Position } from '$lib/core/user-action/position-type';
	import type { ClassValue } from 'svelte/elements';

	const {
		pos,
		tileName,
		class: userClass = '',
		onmousedown,
		onmouseenter,
		onmouseup
	} = $props<{
		/**
		 * Position of this tile in the grid map using UV coordinates.
		 *
		 * ---
		 *
		 * UV 좌표를 사용한 그리드 맵에서의 타일 위치.
		 */
		pos: Position;

		/**
		 * The tile identifier, can be either TilesetKey (string) or TilesetValue (number).
		 * Will fallback from TilesetValue to TilesetKey if not found.
		 *
		 * ---
		 *
		 * 타일 식별자로, TilesetKey (문자열) 또는 TilesetValue (숫자) 모두 가능.
		 * TilesetValue에서 찾지 못하면 TilesetKey로 fallback 처리.
		 */
		tileName: TilesetKey | TilesetValue;

		/**
		 * Additional CSS classes to apply to this tile.
		 *
		 * ---
		 *
		 * 이 타일에 적용할 추가 CSS 클래스.
		 */
		class?: ClassValue;

		/**
		 * Mouse down event handler for editing functionality.
		 *
		 * ---
		 *
		 * 편집 기능을 위한 마우스 다운 이벤트 핸들러.
		 */
		onmousedown?: (event: MouseEvent) => void;

		/**
		 * Mouse enter event handler for drag painting.
		 *
		 * ---
		 *
		 * 드래그 페인팅을 위한 마우스 엔터 이벤트 핸들러.
		 */
		onmouseenter?: (event: MouseEvent) => void;

		/**
		 * Mouse up event handler for editing functionality.
		 *
		 * ---
		 *
		 * 편집 기능을 위한 마우스 업 이벤트 핸들러.
		 */
		onmouseup?: (event: MouseEvent) => void;
	}>();

	/**
	 * Find tile image path with fallback logic.
	 * First tries to match as TilesetValue, then as TilesetKey.
	 *
	 * ---
	 *
	 * fallback 로직을 통해 타일 이미지 경로를 찾습니다.
	 * 먼저 TilesetValue로 매칭 시도, 다음으로 TilesetKey로 시도.
	 */
	function getTileImagePath(name: TilesetKey | TilesetValue): string | null {
		if (typeof name === 'number') {
			const tileKey = Object.keys(Tileset).find(
				(key) => Tileset[key as keyof typeof Tileset] === name
			) as keyof typeof Tileset;
			if (tileKey && TileImage[tileKey]) {
				return TileImage[tileKey];
			}
		}
		if (typeof name === 'string' && name in TileImage) {
			return TileImage[name as TilesetKey];
		}
		console.error(`Invalid tile name: ${name} at position u:${pos.u}, v:${pos.v}`);
		return null;
	}

	const tileImagePath = $derived(getTileImagePath(tileName));
</script>

{#if tileImagePath}
	<div
		class="block h-full w-full {userClass}"
		role="gridcell"
		tabindex={onmousedown ? 0 : -1}
		{onmousedown}
		{onmouseenter}
		{onmouseup}
	>
		<img
			src={tileImagePath}
			alt="Tile at position u:{pos.u}, v:{pos.v}"
			class="h-full w-full object-cover select-none"
			draggable="false"
		/>
	</div>
{:else}
	<div
		class="relative flex h-full w-full items-center justify-center border-2 border-red-500 bg-red-400 {userClass}"
		title="Error: Invalid tile at position u:{pos.u}, v:{pos.v}"
		role="gridcell"
		tabindex={onmousedown ? 0 : -1}
		{onmousedown}
		{onmouseenter}
		{onmouseup}
	>
		<span class="text-xs font-bold text-white">?</span>
	</div>
{/if}

<style>
	/* Styles removed as they are now handled by Tailwind CSS classes */
</style>
