<script lang="ts">
	import { LucideLoaderCircle } from 'lucide-svelte';
	import { Button } from "$lib/components/ui/button";
	import { cn } from "$lib/utils.js";

	let { class: className, ...rest }: {class: string | undefined | null, rest: { [p: string]: unknown }} = $props();

	let isLoading = $state(false);
	async function onSubmit() {
		// event.preventDefault();
		isLoading = true;

		setTimeout(() => {
			isLoading = false;
		}, 3000);
	}
</script>

<div class={cn("grid gap-6", className)} {...rest}>
	<a href="/auth/authentik">
		<Button disabled={isLoading} onclick={onSubmit}>
			{#if isLoading}
				<LucideLoaderCircle class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				<img class="mr-2 h-4 w-4" alt="Authentik Logo" src="https://auth.cazzzer.com/static/dist/assets/icons/icon.svg" />
			{/if}
			Authentik
		</Button>
	</a>
</div>
