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

	function getSize(size: number) {
		let sizes = ['Bytes', 'KiB', 'MiB', 'GiB',
			'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

		for (let i = 1; i < sizes.length; i++) {
			if (size < Math.pow(1024, i))
				return (Math.round((size / Math.pow(
					1024, i - 1)) * 100) / 100) + ' ' + sizes[i - 1];
		}
		return size;
	}
</script>

<svelte:head>
	<title>Connections</title>
</svelte:head>

<Table.Root class="bg-accent rounded-xl">
	<Table.Header>
		<Table.Head>Name</Table.Head>
		<Table.Head>Public Key</Table.Head>
		<Table.Head>Endpoint</Table.Head>
		<Table.Head>Allowed IPs</Table.Head>
		<Table.Head>Latest Handshake</Table.Head>
		<Table.Head>RX</Table.Head>
		<Table.Head>TX</Table.Head>
		<Table.Head class="hidden">Persistent Keepalive</Table.Head>
		<Table.Head class="hidden">Interface Name</Table.Head>
	</Table.Header>
	<Table.Body>
		{#each data.peers.rows as peer}
			<Table.Row class="border-y-2 border-background">
				<Table.Cell>{peer.name}</Table.Cell>
				<Table.Cell class="truncate max-w-[10ch]">{peer['public-key']}</Table.Cell>
				<Table.Cell>{peer.endpoint}</Table.Cell>
				<Table.Cell>
					<div class="flex flex-wrap gap-1">
						{#each peer['allowed-ips'].split(',') as addr}
							<Badge class="bg-background" variant="secondary">{addr}</Badge>
						{/each}
					</div>
				</Table.Cell>
				<Table.Cell>{new Date(peer['latest-handshake'] * 1000).toLocaleString()}</Table.Cell>
				<Table.Cell>{getSize(peer['transfer-rx'])}</Table.Cell>
				<Table.Cell>{getSize(peer['transfer-tx'])}</Table.Cell>
				<Table.Cell class="hidden">{peer['persistent-keepalive']}</Table.Cell>
				<Table.Cell class="hidden">{peer.ifname}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
