<script lang="ts">
	import { LucideLoaderCircle } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		providerName: string;
		displayName: string;
		iconSrc: string;
		inviteToken?: string;
	}
	let { providerName, displayName, inviteToken, iconSrc }: Props = $props();

	let submitted = $state(false);
</script>

<form method="get" onsubmit={() => (submitted = true)} action="/auth/{providerName}">
	{#if inviteToken}
		<input type="hidden" value={inviteToken} name="invite" />
	{/if}
	<Button type="submit" disabled={submitted}>
		{#if submitted}
			<LucideLoaderCircle class="mr-2 h-4 w-4 animate-spin" />
		{:else}
			<img class="mr-2 h-4 w-4" alt="{displayName} Logo" src={iconSrc} />
		{/if}
		Sign {inviteToken ? 'up' : 'in'} with {displayName}
	</Button>
</form>
