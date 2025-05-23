<script lang="ts">
	// Icon component using GPL-licensed IcoMoon Free icons
	// IconSet: Maps semantic names to Iconify identifiers (see icon-kv.ts)
	// IconName: Union type of available icon names
	import { IconSet, type IconName } from './icon-set';
	// Iconify Svelte component for rendering icons
	import Icon from '@iconify/svelte';

	// FP utilities for type-safe operations
	// R: Record operations (key/value validation)
	// S: String type guards (isString check)
	import * as R from 'fp-ts/Record';
	import * as S from 'fp-ts/string';

	// Component props
	// iconName: Required (must be from IconName)
	// width/height: Optional (default: 32)
	const {
		iconName,
		width = 32,
		height = 32
	} = $props<{ iconName: IconName; width?: number; height?: number }>();

	// Resolved Iconify identifier after validation
	let iconId: (typeof IconSet)[IconName] | undefined = $state(undefined);

	// Maps iconName to Iconify identifier
	$effect(() => {
		// 1. Validate input is string 2. Check against IconSet
		const hasKey = S.isString(iconName) && R.has(iconName, IconSet);
		iconId = hasKey ? IconSet[iconName] : undefined;
	});
</script>

{#if S.isString(iconId)}
	<!-- Renders only when valid Iconify identifier exists -->
	<Icon icon={iconId} {width} {height} class="m-0 p-0 border-0" />
{/if}
