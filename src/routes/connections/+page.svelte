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

<Table.Root class="bg-accent rounded-lg overflow-hidden divide-y-2 divide-background">
	<Table.Header>
		<Table.Row>
			<Table.Head scope="col">Name</Table.Head>
			<Table.Head scope="col">Public Key</Table.Head>
			<Table.Head scope="col">Endpoint</Table.Head>
			<Table.Head scope="col">Allowed IPs</Table.Head>
			<Table.Head scope="col">Latest Handshake</Table.Head>
			<Table.Head scope="col">RX</Table.Head>
			<Table.Head scope="col">TX</Table.Head>
			<Table.Head scope="col" class="hidden">Persistent Keepalive</Table.Head>
			<Table.Head scope="col" class="hidden">Interface Name</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body class="divide-y-2 divide-background">
		{#each data.peers.rows as peer}
			<Table.Row class="hover:bg-background hover:bg-opacity-40">
				<Table.Head scope="row">{peer.name}</Table.Head>
				<Table.Cell class="truncate max-w-[10ch]">{peer['public-key']}</Table.Cell>
				<Table.Cell>{peer.endpoint}</Table.Cell>
				<Table.Cell>
					<div class="flex flex-wrap gap-1">
						{#each peer['allowed-ips'].split(',') as addr}
							<Badge class="bg-background select-auto" variant="secondary">{addr}</Badge>
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
