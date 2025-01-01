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

<header class="flex w-full flex-wrap justify-between gap-x-6 gap-y-4 xl:max-w-screen-xl">
	<a href="/" class="contents">
		<span class="font-bold sm:inline-block">VPGen</span>
	</a>
	<nav class="max-w-full">
		<ul class="flex items-center gap-6 overflow-x-auto text-sm">
			<li><a href="/" class={getNavClass(/^\/$/)}>Home</a></li>
			{#if user}
				<li><a href="/user" class={getNavClass(/^\/user$/)}>Profile</a></li>
				<li><a href="/connections" class={getNavClass(/^\/connections$/)}>Connections</a></li>
				<li><a href="/clients" class={getNavClass(/^\/clients(\/\d+)?$/)}>Clients</a></li>
			{/if}
		</ul>
	</nav>
</header>
<main class="flex min-w-full max-w-full flex-grow flex-col gap-4 xl:min-w-[1280px]">
	{@render children()}
</main>

<!--https://github.com/sveltejs/kit/discussions/7585#discussioncomment-9997936-->
<!--Some shenanings needed to be done to get the footer position to stick correctly,
didn't work with display: contents-->
<footer class="inset-x-0 bottom-0 w-full text-center">
	<p>&copy; 2024</p>
</footer>

<style>
</style>
