<script>
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { LucideLoaderCircle, LucideTrash } from 'lucide-svelte';

	const { device } = $props();
	let submitted = $state(false);
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'destructive', size: 'sm', class: 'bg-accent hover:bg-destructive' })}>
		<LucideTrash />
	</Dialog.Trigger>
	<Dialog.Content>
		<form class="contents" method="post" action="/devices/{device.id}?/delete"
					onsubmit={() => submitted = true}
		>
			<Dialog.Header>
				Are you sure you want to permanently delete "{device.name}"?
			</Dialog.Header>
			You will no longer be able to connect from this device.
			<Dialog.Footer class="gap-y-2">
				{#if submitted}
					<LucideLoaderCircle class="size-4 animate-spin place-self-center" />
				{/if}
				<Button type="submit" variant="destructive" disabled={submitted}>
					Delete
				</Button>
				<Dialog.Close asChild let:builder>
					<button class={buttonVariants()} disabled={submitted} use:builder.action {...builder}>
						Cancel
					</button>
				</Dialog.Close>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
