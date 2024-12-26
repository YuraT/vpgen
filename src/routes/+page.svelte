<script lang="ts">
	import { AuthForm } from '$lib/components/app/auth-form';
	import { Button } from '$lib/components/ui/button';

	const { data } = $props();
	const { user } = data;
</script>

<svelte:head>
	<title>VPGen</title>
</svelte:head>

<h1 class="mb-2 scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
	Welcome to VPGen
</h1>

{#if user}
	<p>
		Hi {user.name}!
	</p>
	<section id="get-started" class="border-l-2 pl-6">
		<p>
			To get started,
			<Button class="ml-2 p-2" href="/clients?add=New+Client">Create a New Client</Button>
		</p>
	</section>
{:else}
	<AuthForm class="p-4" />
	<p>VPGen is a VPN generator that allows you to create and manage VPN connections.</p>
{/if}

<style>
	p {
		@apply my-2;
	}
</style>
