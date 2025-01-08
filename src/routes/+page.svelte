<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { AuthForm } from '$lib/components/app/auth-form';

	const { data } = $props();
	const { user } = data;
</script>

<svelte:head>
	<title>VPGen</title>
</svelte:head>

<h1 class="mb-2 scroll-m-20 text-center text-3xl font-extrabold tracking-tight lg:text-4xl">
	Welcome to VPGen
</h1>

{#if user}
	<p>
		Hi {user.name}!
	</p>
	<section id="get-started" class="border-l-2 pl-6">
		<p>
			To get started,
			<Button class="ml-2" href="/devices?add=New+Device">Add a New Device</Button>
		</p>
	</section>
	<!--	<section id="using-wireguard">-->
	<!--		<details class="mt-10">-->
	<!--			<summary class="relative flex flex-col gap-2 pl-10">-->
	<!--				<h2 class="text-xl font-semibold">Using WireGuard</h2>-->
	<!--				To use VPGen, you need to install the WireGuard app on your device.-->
	<!--			</summary>-->
	<!--			<WireguardGuide />-->
	<!--		</details>-->
	<!--	</section>-->
{:else}
	<AuthForm />
	<!--	<p>VPGen is a VPN generator that allows you to create and manage VPN connections.</p>-->
{/if}

<style>
	p {
		@apply my-2;
	}

	/*
	summary::before {
		content: '▶';
		@apply absolute -left-0;
	}
	details[open] summary::before {
		content: '▼';
	}
	*/
</style>
