<script lang="ts">
	import type { PageData } from './$types';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	const { data }: { data: PageData } = $props();

	onMount(() => {
		// refresh every 5 seconds
		setInterval(() => {
			console.log('Refreshing connections');
			invalidate('/api/connections');
		}, 5000);
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

<table>
	<thead>
	<tr>
		<th>Public Key</th>
		<th>Endpoint</th>
		<th>Allowed IPs</th>
		<th>Latest Handshake</th>
		<th>RX</th>
		<th>TX</th>
		<th>Persistent Keepalive</th>
		<th>Name</th>
		<th>Interface Name</th>
	</tr>
	</thead>
	<tbody>
	{#each data.peers.rows as peer}
		<tr>
			<td>{peer['public-key'].substring(0, 10)}</td>
			<td>{peer.endpoint}</td>
			<td>{peer['allowed-ips']}</td>
			{#if peer['latest-handshake']}
				<td>{new Date(peer['latest-handshake'] * 1000)}</td>
			{:else}
				<td>Never</td>
			{/if}
			<td>{getSize(peer['transfer-rx'])}</td>
			<td>{getSize(peer['transfer-tx'])}</td>
			<td>{peer['persistent-keepalive']}</td>
			<td>{peer.name}</td>
			<td>{peer.ifname}</td>
		</tr>
	{/each}
	</tbody>
</table>
