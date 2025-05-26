<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import type { ClassValue } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';
	import { mapState } from '$lib/store/editor/map-state';
	import { mapSize } from '$lib/store/editor/map-size';
	import { Tileset, type TilesetKey, type TilesetValue } from '$lib/core/grid-map/tileset-type';
	import GridCell from '$lib/components/GridMap/GridCell.svelte';
	import type { Position } from '$lib/core/user-action/position-type';

	const { disabled = false, class: className } = $props<{
		disabled?: boolean;
		class?: ClassValue;
	}>();

	// State management
	let selectedTile: TilesetKey = $state('WALL');
	// biome-ignore lint/style/useConst: Svelte5 문법이라 무시함.
	let showGrid: boolean = $state(true);
	let editorMode: 'paint' | 'erase' | 'select' = $state('paint');

	// Available tiles for the palette - Excluding BORDER
	const availableTiles: TilesetKey[] = (Object.keys(Tileset) as TilesetKey[]).filter(
		(tile) => tile !== 'BORDER'
	);

	/**
	 * Handle tile selection from palette
	 * Sets the currently selected tile for painting.
	 */
	function handleTileSelect(tileKey: TilesetKey) {
		selectedTile = tileKey;
		editorMode = 'paint';
	}

	/**
	 * Handle cell click/painting
	 * Updates the map state based on current mode and selected tile.
	 */
	function handleCellInteraction(pos: Position, event: MouseEvent) {
		if (disabled) return;

		const { u, v } = pos;

		mapState.update((currentMap) => {
			const newMap = currentMap.map((row) => [...row]);

			if (u >= 0 && u < newMap.length && v >= 0 && v < newMap[0].length) {
				switch (editorMode) {
					case 'paint':
						newMap[u][v] = Tileset[selectedTile];
						break;
					case 'erase':
						newMap[u][v] = Tileset.EMPTY;
						break;
					case 'select':
						// For future implementation - could select regions
						break;
				}
			}

			return newMap;
		});
	}

	/**
	 * Handle mouse down to start drawing
	 */
	function handleMouseDown(pos: Position, event: MouseEvent) {
		if (disabled) return;
		handleCellInteraction(pos, event);
	}

	/**
	 * Handle mouse enter for continuous drawing
	 */
	function handleMouseEnter(pos: Position, event: MouseEvent) {
		if (disabled) return;
		handleCellInteraction(pos, event);
	}

	/**
	 * Handle mouse up to stop drawing
	 */
	function handleMouseUp() {
		// This function is no longer used in the simplified layout
	}

	/**
	 * Clear the entire map
	 */
	function handleClearMap() {
		if (disabled) return;
		mapState.update((currentMap) => {
			const [mapHeight, mapWidth] = $mapSize.gridSize;
			return Array(mapHeight)
				.fill(null)
				.map(() => Array(mapWidth).fill(Tileset.EMPTY));
		});
	}

	/**
	 * Fill the entire map with selected tile
	 */
	function handleFillMap() {
		if (disabled) return;
		mapState.update((currentMap) => {
			const [mapHeight, mapWidth] = $mapSize.gridSize;
			return Array(mapHeight)
				.fill(null)
				.map(() => Array(mapWidth).fill(Tileset[selectedTile]));
		});
	}

	/**
	 * Get tile name from value for display
	 */
	function getTileName(value: TilesetValue): string {
		const entry = Object.entries(Tileset).find(([, v]) => v === value);
		return entry ? entry[0] : 'UNKNOWN';
	}
</script>

<!-- 
=== TILE SELECTOR COMPONENT - VERTICAL LAYOUT ===

This component focuses on the tile selection palette.
It features a simplified, large vertical layout for tile options.

🎯 COMPONENT OBJECTIVES:
1. Exclude the BORDER tile.
2. Simplify and enlarge the tile selection interface.
3. Vertical layout.

📐 LAYOUT STRUCTURE:
┌─────────────────────────────────────┐ ← h-full
│ ┌─────────────────────────────────┐ │
│ │ Tile Palette (Vertical)         │ │ ← flex-1 overflow-y-auto
│ │ ┌─────────────────────────────┐ │ │
│ │ │ [EMPTY] (Large)             │ │ │
│ │ │ [WALL]  (Large)             │ │ │
│ │ │ [BAT]   (Large)             │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Status Bar (Fixed - Simplified) │ │ ← flex-shrink-0
│ │ [Selected Tile Info]            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

🔑 KEY FEATURES:
- Vertical Tile Palette: Displays available tile types (excluding BORDER) in a large format.
- Selected Tile Info: Shows the currently selected tile name at the bottom.

=== END SECTION ===
-->
<div
	class={twMerge(
		'flex h-full flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm',
		className
	)}
>
	<!-- Tile Palette Area - Vertical, scrollable -->
	<div class="min-h-0 flex-1 overflow-y-auto p-4">
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-semibold text-gray-800">Select a Tile</h3>
			<span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
				{availableTiles.length} Tiles Available
			</span>
		</div>

		<div class="flex flex-col gap-3">
			<!-- Vertical list of tile options -->
			{#each availableTiles as tileKey}
				<button
					type="button"
					class={twMerge(
						'group relative flex h-20 w-full items-center gap-4 overflow-hidden rounded-lg border-2 p-3 text-left transition-all hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none',
						selectedTile === tileKey
							? 'scale-105 border-blue-500 bg-blue-50 shadow-md'
							: 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
					)}
					onclick={() => handleTileSelect(tileKey)}
					title={`Select ${tileKey} tile`}
					{disabled}
				>
					<div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
						<GridCell
							pos={{ u: 0, v: 0 }}
							tileName={tileKey}
							class="transition-transform group-hover:scale-110"
						/>
					</div>
					<div class="flex-grow">
						<span class="text-base font-medium text-gray-800">{tileKey}</span>
						<p class="text-xs text-gray-500">Click to select this tile.</p>
					</div>
					{#if selectedTile === tileKey}
						<div
							class="absolute top-1/2 right-3 -translate-y-1/2 transform rounded-full bg-blue-500 p-1 text-white"
						>
							<Icon iconName="pencil" width={16} height={16} />
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Status Bar Area - Fixed at bottom -->
	<div class="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-3">
		<div class="flex items-center justify-between text-sm">
			<span class="text-gray-600">Selected Tile:</span>
			<span class="font-semibold text-blue-600">{selectedTile}</span>
		</div>
	</div>
</div>
