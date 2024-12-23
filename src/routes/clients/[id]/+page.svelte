<script lang="ts">
	import type { PageData } from './$types';
	import { LucideClipboardCopy } from 'lucide-svelte';

	const { data }: { data: PageData } = $props();

	let tooltipText = $state('Copy to clipboard');

	function copyToClipboard() {
		navigator.clipboard.writeText(data.config).then(() => {
			tooltipText = 'Copied';
		});
	}

	function onMouseLeave() {
		tooltipText = 'Copy to Clipboard';
	}
</script>

<svelte:head>
	<title></title>
</svelte:head>

<h1>Client: {data.client.name}</h1>

<div class="flex relative bg-accent p-2 rounded-xl overflow-x-scroll">
	<pre><code>{data.config}</code></pre>

	<!--Copy button for the configuration-->
	<div class="absolute flex right-2 items-center group">
		<span class="hidden group-hover:block bg-background text-xs rounded py-1 px-2">
			{tooltipText}
		</span>
		<button class="flex items-center justify-center w-10 h-10 bg-background rounded-xl ml-2"
						onclick={copyToClipboard}
						onmouseleave="{onMouseLeave}"
		>
			<LucideClipboardCopy />
		</button>
	</div>
</div>