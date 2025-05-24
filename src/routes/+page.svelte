<script lang="ts">
	import Grid from '$lib/components/GridMap/Grid.svelte';
	import { Tileset, type GridMap } from '$lib/core/grid-map';
	import type { TilesetValue } from '$lib/core/grid-map/tileset-type';

	const rows = 16;
	const cols = 16;

	// Initialize a 16x16 grid.
	// We'll fill it with Tileset.EMPTY as a common default for a new map.
	// If Tileset.EMPTY is not defined in your project's Tileset enum,
	// you might need to replace it with another suitable default value
	// (e.g., Tileset.GROUND, or 0 if TilesetValue is number and 0 is a valid tile).
	const gridMapData: TilesetValue[][] = Array.from({ length: rows }, () =>
		Array(cols).fill(Tileset.EMPTY)
	);

	const gridMap: GridMap = gridMapData;
</script>

<Grid gridMap={gridMap satisfies GridMap} showBorders={true} />
