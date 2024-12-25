<script lang="ts">
	import type { PageData } from './$types';
	import QRCode from 'qrcode-svg';
	import { CodeSnippet } from '$lib/components/app/code-snippet';

	const { data }: { data: PageData } = $props();

	// Clean the client name for the file name,
	// things can break otherwise (too long or invalid characters)
	// https://github.com/pirate/wireguard-docs
	const clientWgCleanedName =
		data.client.name.slice(0, 15).replace(/[^a-zA-Z0-9_=+.-]/g, '_') + '.conf';

	let qrCode = new QRCode({
		content: data.config,
		join: true,
		background: 'hsl(var(--accent-light))',
	});
</script>

<svelte:head>
	<title></title>
</svelte:head>

<h1 class="mb-4 w-fit rounded-lg bg-accent p-2 text-lg">{data.client.name}</h1>

<div class="flex flex-wrap gap-4">
	<CodeSnippet data={data.config} filename={clientWgCleanedName} copy download />

	<div class="overflow-hidden rounded-lg">
		{@html qrCode.svg()}
	</div>
</div>
