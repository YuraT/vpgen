<script lang="ts">
	import '../app.css';
	import { cn } from '$lib/utils';
	import { page } from '$app/state';

	const { data, children } = $props();
	const { user } = data;

	function getNavClass(path: RegExp) {
		return cn(
			'hover:text-foreground/80 transition-colors',
			path.test(page.url.pathname) ? 'text-foreground' : 'text-foreground/60',
		);
	}
</script>

<header class="p-4 sm:flex">
	<span class=" mr-6 font-bold sm:inline-block">VPGen</span>
	<nav>
		<ul class="flex items-center gap-6 text-sm">
			<li><a href="/" class={getNavClass(/^\/$/)}>Home</a></li>
			{#if user}
				<li><a href="/user" class={getNavClass(/^\/user$/)}>Profile</a></li>
				<li><a href="/connections" class={getNavClass(/^\/connections$/)}>Connections</a></li>
				<li><a href="/clients" class={getNavClass(/^\/clients(\/\d+)?$/)}>Clients</a></li>
			{/if}
		</ul>
	</nav>
</header>
<main class="flex flex-grow flex-col p-4">
	{@render children()}
</main>

<!--https://github.com/sveltejs/kit/discussions/7585#discussioncomment-9997936-->
<!--Some shenanings needed to be done to get the footer position to stick correctly,
didn't work with display: contents-->
<footer class="relative inset-x-0 bottom-0 p-4 text-center">
	<p>&copy; 2024</p>
</footer>
