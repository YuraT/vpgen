<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { LucidePlus } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { Label } from '$lib/components/ui/label';
	import { page } from '$app/state';

	const { data }: { data: PageData } = $props();

	let dialogOpen = $state(page.url.searchParams.has('add'));
	let dialogVal = $state(page.url.searchParams.get('add') ?? '');

	$effect(() => {
		if (dialogOpen) page.url.searchParams.set('add', dialogVal);
		else page.url.searchParams.delete('add');

		window.history.replaceState(history.state, '', page.url);
	});
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
			<Table.Row class="hover:bg-surface group">
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
<Dialog.Root bind:open={dialogOpen}>
	<div class="mt-auto flex self-end pt-4">
		<Dialog.Trigger class={buttonVariants({ variant: 'default' }) + ' flex gap-4'}>
			<LucidePlus />
			New Client
		</Dialog.Trigger>
	</div>
	<Dialog.Content class="max-w-xs">
		<form class="contents" method="post" action="?/create">
			<Dialog.Header class="">
				<Dialog.Title>Create a new client</Dialog.Title>
			</Dialog.Header>
			<div class="flex flex-wrap items-center justify-between gap-4">
				<Label for="name">Name</Label>
				<Input
					bind:value={dialogVal}
					required
					pattern=".*[^\s]+.*"
					type="text"
					name="name"
					placeholder="New Client"
					class="max-w-[20ch]"
				/>
			</div>
			<Dialog.Footer>
				<Button type="submit">Create</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
