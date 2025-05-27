<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import type { ClassValue } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';
	import { Tileset, type TilesetKey } from '$lib/core/grid-map/tileset-type';
	import GridCell from '$lib/components/GridMap/GridCell.svelte';
	import { selectedTile } from '$lib/store/editor';
	import { activeTab } from '$lib/store/editor/active-tab';
	const { disabled = false, class: className } = $props<{
		disabled?: boolean;
		class?: ClassValue;
	}>();

	// Available tiles for the palette - Excluding BORDER
	const availableTiles: TilesetKey[] = (Object.keys(Tileset) as TilesetKey[]).filter(
		(tile) => tile !== 'BORDER'
	);

	// Check if Edit mode is currently active
	const isEditModeActive = $derived($activeTab === 'edit');
</script>

<!-- 
=== TILE SELECTOR COMPONENT - VERTICAL LAYOUT ===

This component focuses on the tile selection palette.
It features a simplified, large vertical layout for tile options.

🎯 COMPONENT OBJECTIVES:
1. Exclude the BORDER tile.
2. Simplify and enlarge the tile selection interface.
3. Vertical layout.
4. Provide visual feedback when Edit tab is not active.

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
- Edit Mode Status: Visual feedback when Edit tab is not active.

=== END SECTION ===
-->
<div
	class={twMerge(
		'flex h-full flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm',
		!isEditModeActive && 'opacity-75',
		className
	)}
>
	<!-- Edit Mode Status Warning (shown when Edit tab is not active) -->
	{#if !isEditModeActive}
		<div class="flex-shrink-0 border-b border-orange-200 bg-orange-50 p-3">
			<div class="flex items-center gap-2 text-sm">
				<div class="text-orange-500">
					<Icon iconName="feedback" width={16} height={16} />
				</div>
				<span class="font-medium text-orange-800">Edit mode inactive</span>
			</div>
			<p class="mt-1 text-xs text-orange-600">
				Switch to the Edit tab to enable tile editing functionality.
			</p>
		</div>
	{/if}

	<!-- Tile Palette Area - Vertical, scrollable -->
	<div class="min-h-0 flex-1 overflow-y-auto p-4">
		<div class="mb-4 flex items-center justify-between">
			<h3
				class={twMerge('text-lg font-semibold text-gray-800', !isEditModeActive && 'text-gray-500')}
			>
				Select a Tile
			</h3>
			<span
				class={twMerge(
					'rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700',
					!isEditModeActive && 'bg-gray-100 text-gray-500'
				)}
			>
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
						$selectedTile === tileKey
							? 'scale-105 border-blue-500 bg-blue-50 shadow-md'
							: 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50',
						!isEditModeActive && 'cursor-not-allowed opacity-60 hover:scale-100 hover:shadow-none'
					)}
					onclick={() => {
						if (isEditModeActive) {
							selectedTile.set(tileKey);
						}
					}}
					title={isEditModeActive ? `Select ${tileKey} tile` : 'Switch to Edit tab to select tiles'}
					disabled={disabled || !isEditModeActive}
				>
					<div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
						<GridCell
							pos={{ u: 0, v: 0 }}
							tileName={tileKey}
							class={twMerge(
								'transition-transform group-hover:scale-110',
								!isEditModeActive && 'group-hover:scale-100'
							)}
						/>
					</div>
					<div class="flex-grow">
						<span
							class={twMerge(
								'text-base font-medium text-gray-800',
								!isEditModeActive && 'text-gray-500'
							)}
						>
							{tileKey}
						</span>
						<p class={twMerge('text-xs text-gray-500', !isEditModeActive && 'text-gray-400')}>
							{isEditModeActive ? 'Click to select this tile.' : 'Edit mode inactive.'}
						</p>
					</div>
					{#if $selectedTile === tileKey && isEditModeActive}
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
	<div
		class={twMerge(
			'flex-shrink-0 border-t border-gray-200 bg-gray-50 p-3',
			!isEditModeActive && 'bg-gray-100'
		)}
	>
		<div class="flex items-center justify-between text-sm">
			<span class={twMerge('text-gray-600', !isEditModeActive && 'text-gray-500')}>
				Selected Tile:
			</span>
			<span class={twMerge('font-semibold text-blue-600', !isEditModeActive && 'text-gray-500')}>
				{$selectedTile || 'None'}
			</span>
		</div>
		{#if !isEditModeActive}
			<div class="mt-2 text-xs text-gray-500">
				📝 Tile selection is disabled when Edit tab is not active
			</div>
		{/if}
	</div>
</div>
