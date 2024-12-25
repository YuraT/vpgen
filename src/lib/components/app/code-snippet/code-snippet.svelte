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

	async function copyToClipboard() {
		await navigator.clipboard.writeText(data);
		wasCopied = true;
	}
</script>

<div class="relative max-w-fit overflow-x-hidden rounded-lg bg-accent">
	<div class="flex items-start overflow-x-auto p-2">
		<pre><code>{data}</code></pre>

		{#if copy || download}
			<!--Copy button-->
			<!--Flex reverse for peer hover to work properly-->
			<div class="absolute right-2 flex flex-col gap-2">
				{#if copy}
					<div class="flex flex-row-reverse items-center gap-1">
						<Button
							class="peer size-10 p-2"
							onclick={copyToClipboard}
							onmouseleave={() => (wasCopied = false)}
						>
							<LucideClipboardCopy />
						</Button>
						<span class="hidden rounded-lg bg-background p-2 text-xs peer-hover:block">
							{wasCopied ? 'Copied' : 'Copy to clipboard'}
						</span>
					</div>
				{/if}

				{#if download}
					<div class="flex flex-row-reverse items-center gap-1">
						<a
							class="peer contents"
							href={`data:application/octet-stream;charset=utf-8,${encodeURIComponent(data)}`}
							download={filename}
						>
							<Button class="size-10 p-2">
								<LucideDownload />
							</Button>
						</a>
						<span class="hidden rounded-lg bg-background p-2 text-xs peer-hover:block">
							Download
						</span>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
