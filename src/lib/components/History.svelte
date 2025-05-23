<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import { GridHistory } from '$lib/store/history';

	// TODO: undo/redo를 시도할 때, 실패한다면 alert 등의 UX를 고려한 방법을 통해 알려줄 수 있으면 좋을 것 같아.
</script>

<!-- 
History component with properly sized icons matching Button component style
Uses custom Icon component instead of direct Iconify for consistent sizing

---

Button 컴포넌트 스타일에 맞는 적절한 크기의 아이콘을 가진 히스토리 컴포넌트
일관된 크기를 위해 직접 Iconify 대신 사용자 정의 Icon 컴포넌트 사용
-->
<div class="flex gap-2 rounded-md bg-gray-100 p-2">
	<button
		class="flex items-center justify-center rounded-lg bg-white p-3 shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
		onclick={() => GridHistory.undo()}
		aria-label="Undo"
	>
		<Icon iconName="undo" width={24} height={24} />
	</button>
	<button
		class="flex items-center justify-center rounded-lg bg-white p-3 shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
		onclick={() => GridHistory.redo()}
		aria-label="Redo"
	>
		<Icon iconName="redo" width={24} height={24} />
	</button>
</div>
