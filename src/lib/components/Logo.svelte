<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import type { ClassValue } from 'svelte/elements';

	const { class: class_ } = $props<{
		class?: ClassValue;
	}>();
</script>

<!--
  Logo Component
  - `font-pixel` class is defined in `tailwind.config.ts` and uses the 'Press Start 2P' font.
  - The 'Press Start 2P' font is loaded via Google Fonts in `src/app.html`.
-->
<div class={twMerge('flex flex-1 rounded-lg bg-[#aaaaff] p-4 text-2xl', class_)}>
	{@html import.meta.env.VITE_TITLE}
</div>

<style>
	div {
		font-family: 'Press Start 2P', cursive;
	}
</style>
