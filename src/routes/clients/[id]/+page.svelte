<script lang="ts">
	import type { PageData } from './$types';
	import { LucideClipboardCopy } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import QRCode from 'qrcode-svg';

	const { data }: { data: PageData } = $props();

	let tooltipText = $state('Copy to clipboard');
	let qrCode = new QRCode({
		content: data.config,
		join: true,
	});

	async function copyToClipboard() {
		await navigator.clipboard.writeText(data.config);
		tooltipText = 'Copied!';
	}

	function onMouseLeave() {
		tooltipText = 'Copy to clipboard';
	}
</script>

<svelte:head>
	<title></title>
</svelte:head>

<h1 class="bg-accent text-lg w-fit rounded-lg p-2 mb-4">{data.client.name}</h1>

<div class="flex flex-wrap gap-4">
	<div class="relative bg-accent rounded-lg max-w-fit">
		<div class="flex items-start p-2 overflow-x-auto">
			<pre><code>{data.config}</code></pre>

			<!--Copy button for the configuration-->
			<!--Flex reverse for peer hover to work properly-->
			<div class="absolute group flex flex-row-reverse items-center gap-1 right-2">
				<Button class="peer size-10 p-2"
								onclick={copyToClipboard}
								onmouseleave={onMouseLeave}
				>
					<LucideClipboardCopy />
				</Button>
				<span class="hidden peer-hover:block bg-background text-xs rounded-lg p-2">
				{tooltipText}
			</span>
			</div>
		</div>
	</div>

	<div class="rounded-lg overflow-hidden">
		{@html qrCode.svg()}
	</div>
</div>
