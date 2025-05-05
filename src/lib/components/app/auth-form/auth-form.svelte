<script lang="ts">
	import { cn } from '$lib/utils.js';
	import googleIcon from '$lib/assets/google.svg';
	import { enabledAuthProviders } from '$lib/auth';
	import AuthButton from './auth-button.svelte';

	interface Props {
		inviteToken?: string;
		class?: string;
	}
	let { inviteToken, class: className }: Props = $props();
</script>

<div class={cn('flex gap-6', className)}>
	{#if enabledAuthProviders.authentik}
		<AuthButton
			providerName="authentik"
			displayName="Authentik"
			iconSrc="https://auth.cazzzer.com/static/dist/assets/icons/icon.svg"
			{inviteToken}
		/>
	{/if}
	{#if enabledAuthProviders.google}
		<AuthButton providerName="google" displayName="Google" iconSrc={googleIcon} {inviteToken} />
	{/if}
</div>
