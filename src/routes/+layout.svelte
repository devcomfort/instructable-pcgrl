<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import '../tailwind.css';
</script>

<div class="flex h-screen w-screen flex-col">
	<!-- header -->
	<Header />

	<!-- main content -->
	<!-- TODO: <slot /> 와 Sidebar 컴포넌트의 영역 크기가 자동으로 조정되도록 해야함 -->
	<Sidebar />
	<slot />

	<!-- TODO: footer 추가 필요 -->
</div>
