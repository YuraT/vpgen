<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<header class="p-4">
	<h1 class="text-2xl font-bold">My App</h1>
	<nav>
		<a href="/">Home</a>
		<a href="/about">About</a>
	</nav>
</header>
<main class="flex-grow p-4">
	{@render children()}
</main>

<footer class="p-4 text-center">
	<p>&copy; 2024</p>
</footer>
