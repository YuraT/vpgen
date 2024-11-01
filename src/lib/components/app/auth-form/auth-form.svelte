<script lang="ts">
	import { LucideLoaderCircle } from 'lucide-svelte';
	import { Button } from "$lib/components/ui/button";
	import { cn } from "$lib/utils.js";

	let { class: className, ...rest }: {class: string | undefined | null, rest: { [p: string]: unknown }} = $props();

	let isLoading = $state(false);
</script>

<div class={cn("grid gap-6", className)} {...rest}>
	<form method="get" action="/auth/authentik">
		<Button type="submit" onclick={() => {isLoading=true}}>
			{#if isLoading}
				<LucideLoaderCircle class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				<img class="mr-2 h-4 w-4" alt="Authentik Logo" src="https://auth.cazzzer.com/static/dist/assets/icons/icon.svg" />
			{/if}
			Sign in with Authentik
		</Button>
	</form>
</div>
