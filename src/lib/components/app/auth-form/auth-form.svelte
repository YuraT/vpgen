<script lang="ts">
	import { LucideLoaderCircle } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';
	import googleIcon from '$lib/assets/google.svg';
	import { enabledAuthProviders } from '$lib/auth';

	let { inviteToken, class: className, ...rest }: {
		inviteToken?: string;
		class?: string;
		rest?: { [p: string]: unknown }
	} = $props();

	let submitted = $state(false);
</script>

<div class={cn('flex gap-6', className)} {...rest}>
	{#if enabledAuthProviders.authentik }
	<form method="get" onsubmit={() => submitted = true}
				action="/auth/authentik{inviteToken ? `?invite=${inviteToken}` : ''}">
		<input type="hidden" value={inviteToken} name="invite" />
		<Button type="submit" disabled={submitted}>
			{#if submitted}
				<LucideLoaderCircle class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				<img
					class="mr-2 h-4 w-4"
					alt="Authentik Logo"
					src="https://auth.cazzzer.com/static/dist/assets/icons/icon.svg"
				/>
			{/if}
			Sign in with Authentik
		</Button>
	</form>
	{/if}
	{#if enabledAuthProviders.google }
	<form method="get" onsubmit={() => submitted = true}
				action="/auth/google{inviteToken ? `?invite=${inviteToken}` : ''}">
		<input type="hidden" value={inviteToken} name="invite" />
		<Button type="submit" disabled={submitted}>
			{#if submitted}
				<LucideLoaderCircle class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				<img
					class="mr-2 h-4 w-4"
					alt="Google Logo"
					src={googleIcon}
				/>
			{/if}
			Sign in with Google
		</Button>
	</form>
	{/if}
</div>
