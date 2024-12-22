<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';

	const { data, children } = $props();
	const { user } = data;

	function getNavClass(path: string) {
		return cn("hover:text-foreground/80 transition-colors",
			$page.url.pathname === path ? "text-foreground" : "text-foreground/60");
	}
</script>

<header class="p-4 sm:flex">
	<span class=" mr-6 font-bold sm:inline-block">VPGen</span>
	<nav class="flex items-center gap-6 text-sm">
		<a href="/" class={getNavClass("/")}>Home</a>
		{#if user}
			<a href="/user" class={getNavClass("/user")}>Profile</a>
			<a href="/connections" class={getNavClass("/connections")}>Connections</a>
			<a href="/clients" class={getNavClass("/clients")}>Clients</a>
		{/if}
	</nav>
</header>
<main class="flex-grow p-4">
	{@render children()}
</main>

<!--https://github.com/sveltejs/kit/discussions/7585#discussioncomment-9997936-->
<!--Some shenanings needed to be done to get the footer position to stick correctly,
didn't work with display: contents-->
<footer class="p-4 relative text-center inset-x-0 bottom-0">
	<p>&copy; 2024</p>
</footer>
