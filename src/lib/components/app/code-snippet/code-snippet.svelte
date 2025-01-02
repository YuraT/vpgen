<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { LucideClipboardCopy, LucideDownload } from 'lucide-svelte';

	const {
		data,
		filename,
		copy,
		download,
	}: {
		data: string;
		filename?: string;
		copy?: boolean;
		download?: boolean;
	} = $props();

	let wasCopied = $state(false);

	const roundedPre = copy || download ? 'rounded-b-lg' : 'rounded-lg';

	async function copyToClipboard() {
		await navigator.clipboard.writeText(data);
		wasCopied = true;
	}
</script>

<div class="flex max-w-full flex-grow flex-col rounded-lg bg-accent">
	{#if copy || download}
		<!--Copy and download buttons-->
		<div class="b flex flex-wrap items-center justify-between gap-4 rounded-t-lg p-2">
			Configuration
			<div class="flex gap-2">
				{#if copy}
					<Button
						class="action-button group"
						onclick={copyToClipboard}
						onmouseleave={() => (wasCopied = false)}
					>
						<LucideClipboardCopy />
						<span class="group-hover:block">
							{wasCopied ? 'Copied' : 'Copy to clipboard'}
						</span>
					</Button>
				{/if}

				{#if download}
					<a
						class="contents"
						href={`data:application/octet-stream;charset=utf-8,${encodeURIComponent(data)}`}
						download={filename}
					>
						<Button class="action-button group">
							<LucideDownload />
							<span class="group-hover:block">Download</span>
						</Button>
					</a>
				{/if}
			</div>
		</div>
	{/if}
	<div class="bg-surface flex items-start overflow-x-auto {roundedPre} p-2">
		<pre><code>{data}</code></pre>
	</div>
</div>

<style>
	:global(.action-button) {
		@apply relative size-auto p-2;
	}

	:global(.action-button > span) {
		@apply absolute bottom-full mb-3 hidden rounded-lg bg-muted p-2 text-xs text-foreground;
	}
</style>
