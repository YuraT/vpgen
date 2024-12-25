<script lang="ts">
	import type { PageData } from './$types';
	import { LucideClipboardCopy, LucideDownload } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import QRCode from 'qrcode-svg';

	const { data }: { data: PageData } = $props();

	// Clean the client name for the file name,
	// things can break otherwise (too long or invalid characters)
	// https://github.com/pirate/wireguard-docs
	const clientWgCleanedName = data.client.name.slice(0, 15).replace(/[^a-zA-Z0-9_=+.-]/g, '_') + '.conf';

	let configWasCopied = $state(false);
	let qrCode = new QRCode({
		content: data.config,
		join: true,
	});

	async function copyToClipboard() {
		await navigator.clipboard.writeText(data.config);
		configWasCopied = true;
	}

</script>

<svelte:head>
	<title></title>
</svelte:head>

<h1 class="bg-accent text-lg w-fit rounded-lg p-2 mb-4">{data.client.name}</h1>

<div class="flex flex-wrap gap-4">
	<div class="relative bg-accent rounded-lg max-w-fit overflow-x-hidden">
		<div class="flex items-start p-2 overflow-x-auto">
			<pre><code>{data.config}</code></pre>

			<!--Copy button for the configuration-->
			<!--Flex reverse for peer hover to work properly-->
			<div class="absolute flex flex-col gap-2 right-2">
				<div class="group flex flex-row-reverse items-center gap-1">
					<Button class="peer size-10 p-2"
									onclick={copyToClipboard}
									onmouseleave={() => configWasCopied = false}
					>
						<LucideClipboardCopy />
					</Button>
					<span class="hidden peer-hover:block bg-background text-xs rounded-lg p-2">
						{configWasCopied ? 'Copied' : 'Copy config to clipboard'}
					</span>
				</div>

				<div class="group flex flex-row-reverse items-center gap-1">
					<a class="peer contents" href={`data:application/octet-stream;charset=utf-8,${encodeURIComponent(data.config)}`}
						 download={clientWgCleanedName}>
						<Button class="size-10 p-2">
							<LucideDownload />
						</Button>
					</a>
					<span class="hidden peer-hover:block bg-background text-xs rounded-lg p-2">
						Download config file
					</span>
				</div>
			</div>
		</div>
	</div>

	<div class="rounded-lg overflow-hidden">
		{@html qrCode.svg()}
	</div>
</div>
