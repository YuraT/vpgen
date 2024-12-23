<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Clients</title>
</svelte:head>

<Table.Root class="bg-accent rounded-xl">
	<Table.Header>
		<Table.Head>Name</Table.Head>
		<Table.Head>Public Key</Table.Head>
		<Table.Head>Private Key</Table.Head>
		<Table.Head>Pre-Shared Key</Table.Head>
		<Table.Head>IP Allocation</Table.Head>
	</Table.Header>
	<Table.Body>
		{#each data.clients as client}
			<Table.Row class="border-y-2 border-background">
				<Table.Cell>{client.name}</Table.Cell>
				<Table.Cell class="truncate max-w-[10ch]">{client.publicKey}</Table.Cell>
				<Table.Cell class="truncate max-w-[10ch]">{client.privateKey}</Table.Cell>
				<Table.Cell class="truncate max-w-[10ch]">{client.preSharedKey}</Table.Cell>
				<Table.Cell>
					<Badge class="bg-background select-auto" variant="secondary">{client.ipAllocation.id}</Badge>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
