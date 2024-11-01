<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';

	const { data, children } = $props();
	const { user } = data;
</script>

<header class="p-4 md:flex">
	<span class=" mr-6 font-bold xl:inline-block">My App</span>
	<nav class="flex items-center gap-6 text-sm">
		<a href="/" class={cn("hover:text-foreground/80 transition-colors",
				$page.url.pathname === "/" ? "text-foreground" : "text-foreground/60")}>Home</a>
		{#if user}
			<a href="/user" class={cn("hover:text-foreground/80 transition-colors",
				$page.url.pathname === "/user" ? "text-foreground" : "text-foreground/60")}>Profile</a>
		{/if}
	</nav>
</header>
<main class="flex-grow p-4">
	{@render children()}
</main>

<footer class="p-4 text-center">
	<p>&copy; 2024</p>
</footer>
