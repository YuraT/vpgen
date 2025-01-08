<script lang="ts">
	import type { PageData } from './$types';
	import { invalidate } from '$app/navigation';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';

	const { data }: { data: PageData } = $props();

	$effect(() => {
		// refresh every 5 seconds
		const interval = setInterval(() => {
			console.log('Refreshing connections');
			invalidate('/api/connections');
		}, 5000);

		return () => clearInterval(interval);
	});

	function toSizeString(size: number) {
		let sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

		for (let i = 1; i < sizes.length; i++) {
			if (size < Math.pow(1024, i))
				return Math.round((size / Math.pow(1024, i - 1)) * 100) / 100 + ' ' + sizes[i - 1];
		}
		return size;
	}
</script>

<svelte:head>
	<title>Connections</title>
</svelte:head>

<Table.Root class="divide-y-2 divide-background overflow-hidden rounded-lg bg-accent">
	<Table.Header>
		<Table.Row>
			<Table.Head scope="col">Device</Table.Head>
			<Table.Head scope="col">Public Key</Table.Head>
			<Table.Head scope="col">Endpoint</Table.Head>
			<Table.Head scope="col">Device IPs</Table.Head>
			<Table.Head scope="col">Latest Handshake</Table.Head>
			<Table.Head scope="col">RX</Table.Head>
			<Table.Head scope="col">TX</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body class="divide-y-2 divide-background">
		{#each data.connections as conn}
			<Table.Row class="hover:bg-surface">
				<Table.Head scope="row">{conn.deviceName}</Table.Head>
				<Table.Cell class="max-w-[10ch] truncate">{conn.devicePublicKey}</Table.Cell>
				<Table.Cell>{conn.endpoint}</Table.Cell>
				<Table.Cell>
					<div class="flex flex-wrap gap-1">
						{#each conn.deviceIps as addr}
							<Badge class="select-auto bg-background" variant="secondary">{addr}</Badge>
						{/each}
					</div>
				</Table.Cell>
				<Table.Cell>{new Date(conn.latestHandshake).toLocaleString()}</Table.Cell>
				<Table.Cell>{toSizeString(conn.transferRx)}</Table.Cell>
				<Table.Cell>{toSizeString(conn.transferTx)}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
