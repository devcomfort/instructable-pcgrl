<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import '../tailwind.css';
</script>

<div class="flex h-screen w-screen flex-col overflow-hidden">
	<!-- header -->
	<Header />

	<!-- main content area -->
	<div class="flex flex-1 overflow-hidden">
		<!-- {/* Sidebar: fixed width, shrinks if necessary, no growth */} -->
		<Sidebar />

		<slot />
	</div>

	<footer class="h-12 shrink-0 bg-gray-100 p-4 text-center text-sm text-gray-600">
		<p>&copy; 2024 Your Application. All rights reserved.</p>
	</footer>
</div>
