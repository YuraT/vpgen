<script lang="ts">
	import type { PageData } from './$types';
	import QRCode from 'qrcode-svg';
	import { CodeSnippet } from '$lib/components/app/code-snippet';
	import { WireguardGuide } from '$lib/components/app/wireguard-guide';

	const { data }: { data: PageData } = $props();

	// Clean the device name for the wg config filename,
	// things can break otherwise (too long or invalid characters)
	// https://github.com/pirate/wireguard-docs
	const deviceWgCleanedName =
		data.device.name.slice(0, 15).replace(/[^a-zA-Z0-9_=+.-]/g, '_') + '.conf';

	let qrCode = new QRCode({
		content: data.config,
		join: true,
		background: 'hsl(var(--accent-light))',
		width: 296,
		height: 296,
	});
</script>

<svelte:head>
	<title>{data.device.name}</title>
</svelte:head>

<h1 class="w-fit rounded-lg bg-accent p-2 text-lg">{data.device.name}</h1>

<section id="device-configuration" class="flex flex-wrap items-center justify-center gap-4">
	<CodeSnippet data={data.config} filename={deviceWgCleanedName} copy download />

	<div class="size-fit overflow-auto rounded-lg">
		{@html qrCode.svg()}
	</div>
</section>
<section id="usage" class="flex w-full flex-col gap-2">
	<h2 class="text-xl font-semibold">Usage</h2>
	<p>To use VPGen, you need to install the WireGuard app on your device.</p>
	<WireguardGuide />
</section>
