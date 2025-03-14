<script lang="ts">
	import { AuthForm } from '$lib/components/app/auth-form';
	import { page } from '$app/state';

	let inviteToken = page.params.id;
</script>

<svelte:head>
	<title>You are Invited to VPGen</title>
</svelte:head>

<h1 class="mb-2 scroll-m-20 text-center text-3xl font-extrabold tracking-tight lg:text-4xl">
	Welcome to VPGen
</h1>

<AuthForm inviteToken={inviteToken} />
