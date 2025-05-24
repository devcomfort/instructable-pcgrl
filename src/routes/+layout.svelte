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
</div>
