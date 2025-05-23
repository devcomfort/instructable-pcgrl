<script lang="ts">
	import { numberOfStep } from '$lib/store/generator/number-of-step';
</script>

<div class="flex flex-col items-center gap-y-[10px] rounded-lg bg-gray-100 p-4 shadow-md">
	<div class="flex items-center gap-x-3 text-gray-700">
		<span>Step Size</span>
		<input
			type="range"
			min="1"
			max="25"
			bind:value={$numberOfStep}
			class="h-2 w-48 cursor-pointer appearance-none rounded-lg bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
		/>
		<span class="w-6 text-right">{$numberOfStep}</span>
	</div>
</div>
