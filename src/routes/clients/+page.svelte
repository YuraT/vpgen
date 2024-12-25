<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { LucidePlus } from 'lucide-svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Clients</title>
</svelte:head>

<Table.Root class="divide-y-2 divide-background overflow-hidden rounded-lg bg-accent">
	<Table.Header>
		<Table.Row>
			<Table.Head scope="col">Name</Table.Head>
			<Table.Head scope="col">Public Key</Table.Head>
			<!--			<Table.Head scope="col">Private Key</Table.Head>-->
			<!--			<Table.Head scope="col">Pre-Shared Key</Table.Head>-->
			<Table.Head scope="col">IP Allocation</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body class="divide-y-2 divide-background">
		{#each data.clients as client}
			<Table.Row class="group hover:bg-background hover:bg-opacity-40">
				<Table.Head scope="row">
					<a
						href={`/clients/${client.id}`}
						class="flex size-full items-center group-hover:underline"
					>
						{client.name}
					</a>
				</Table.Head>
				<Table.Cell class="truncate">{client.publicKey}</Table.Cell>
				<!--				<Table.Cell class="truncate max-w-[10ch]">{client.privateKey}</Table.Cell>-->
				<!--				<Table.Cell class="truncate max-w-[10ch]">{client.preSharedKey}</Table.Cell>-->
				<Table.Cell class="flex flex-wrap gap-1">
					{#each client.ips as ip}
						<Badge class="select-auto bg-background" variant="secondary">{ip}</Badge>
					{/each}
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>

<!--Floating action button for adding a new client-->
<!--Not sure if this is the best place for the input field, will think about it later-->
<form class="mt-auto flex self-end pt-4" method="post" action="?/create">
	<Input required type="text" name="name" placeholder="New Client" class="mr-2" />
	<Button type="submit">
		<LucidePlus class="mr-2 h-4 w-4" />
		Add Client
	</Button>
</form>
