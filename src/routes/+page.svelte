<script lang="ts">
	import Grid from '$lib/components/GridMap/Grid.svelte';
	import { mapState } from '$lib/store/editor';
</script>

<Grid gridMap={$mapState} showBorders={true} />
