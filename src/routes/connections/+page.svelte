<script lang="ts">
	import type { PageData } from './$types';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import * as Table from '$lib/components/ui/table';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';

	const { data }: { data: PageData } = $props();
	let showOnlyActive = $state($page.url.searchParams.get('showOnlyActive') === '1');

	$effect(() => {
		// refresh every 5 seconds
		const interval = setInterval(() => {
			console.log('Refreshing connections');
			invalidate('/api/connections');
		}, 5000);

		return () => clearInterval(interval);
	});
	$effect(() => {
		window.history.replaceState(history.state, '', window.location.pathname + `?showOnlyActive=${showOnlyActive? 1 : 0}`);
		// other options that worked less well (at some things)
		// pushState('', {showOnlyActive: showOnlyActive});
		// goto(`?showOnlyActive=${showOnlyActive? 1 : 0}`);
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

<Checkbox id="showOnlyActive" bind:checked={showOnlyActive} />
<Label for="showOnlyActive">Show only active connections</Label>

<Table.Root class="bg-accent rounded-xl">
	<Table.Header>
		<Table.Head>Name</Table.Head>
		<Table.Head>Public Key</Table.Head>
		<Table.Head>Endpoint</Table.Head>
		<Table.Head>Allowed IPs</Table.Head>
		<Table.Head>Latest Handshake</Table.Head>
		<Table.Head>RX</Table.Head>
		<Table.Head>TX</Table.Head>
		<Table.Head>Persistent Keepalive</Table.Head>
		<Table.Head>Interface Name</Table.Head>
	</Table.Header>
	<Table.Body>
		{#each data.peers.rows as peer}
			{#if peer['latest-handshake'] || !showOnlyActive }
				<Table.Row class="border-y-2 border-background">
					<Table.Cell>{peer.name}</Table.Cell>
					<Table.Cell>{peer['public-key'].substring(0, 10)}</Table.Cell>
					<Table.Cell>{peer.endpoint}</Table.Cell>
					<Table.Cell>{peer['allowed-ips']}</Table.Cell>
					{#if peer['latest-handshake']}
						<Table.Cell>{new Date(peer['latest-handshake'] * 1000).toLocaleString()}</Table.Cell>
						<Table.Cell>{getSize(peer['transfer-rx'])}</Table.Cell>
						<Table.Cell>{getSize(peer['transfer-tx'])}</Table.Cell>
					{:else}
						<Table.Cell>Never</Table.Cell>
						<Table.Cell>--</Table.Cell>
						<Table.Cell>--</Table.Cell>
					{/if}
					<Table.Cell>{peer['persistent-keepalive']}</Table.Cell>
					<Table.Cell>{peer.ifname}</Table.Cell>
				</Table.Row>
			{/if}
		{/each}
	</Table.Body>
</Table.Root>
