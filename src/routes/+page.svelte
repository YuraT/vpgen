<script lang="ts">
	import { AuthForm } from '$lib/components/app/auth-form';

	const { data } = $props();
	const { user } = data;
</script>

<h1>Welcome to SvelteKit</h1>

{#if user }
	<p>Hi {user.name}</p>
{:else}
	<AuthForm class="p-4" />
{/if}
