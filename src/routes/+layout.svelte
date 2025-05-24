<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import Header from '$lib/components/Header.svelte';
	import '../tailwind.css';
</script>

<div class="flex h-screen w-screen flex-col overflow-hidden">
	<!-- header -->
	<Header />

	<!-- main content area -->
	<div class="flex flex-1 overflow-hidden">
		<div class="flex-1 overflow-y-auto p-4">
			<slot />
		</div>

		<Chat />
	</div>

	<!-- TODO : 저작권 표시 업데이트하기 -->
	<footer class="h-12 shrink-0 bg-gray-100 p-4 text-center text-sm text-gray-600">
		<p>&copy; 2024 Your Application. All rights reserved.</p>
	</footer>
</div>
