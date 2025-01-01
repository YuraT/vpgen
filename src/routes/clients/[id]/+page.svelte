<script lang="ts">
	import type { PageData } from './$types';
	import QRCode from 'qrcode-svg';
	import { CodeSnippet } from '$lib/components/app/code-snippet';
	import { WireguardGuide } from '$lib/components/app/wireguard-guide/index.js';

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
	<title>{data.client.name}</title>
</svelte:head>

<h1 class="w-fit rounded-lg bg-accent p-2 text-lg">{data.client.name}</h1>

<section id="client-configuration" class="flex flex-wrap justify-center gap-4">
	<CodeSnippet data={data.config} filename={clientWgCleanedName} copy download />

	<div class="overflow-hidden rounded-lg">
		{@html qrCode.svg()}
	</div>
</section>
<section id="usage" class="flex w-full flex-col gap-2">
	<h2 class="text-xl font-semibold">Usage</h2>
	<p>To use VPGen, you need to install the WireGuard app on your device.</p>
	<WireguardGuide />
</section>
