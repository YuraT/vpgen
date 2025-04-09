<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { LucideLoaderCircle, LucideLogOut, LucideRefreshCw } from '@lucide/svelte';
	import { CodeSnippet } from '$lib/components/app/code-snippet/index.js';

	let { data } = $props();
	let isLoadingSignOut = $state(false);

	function refetch() {
		console.log('refetching');
		invalidate((url) => {
			console.log('invalidation url', url);
			return true;
		});
		invalidateAll();
	}
</script>

<div class="flex flex-col gap-2">
	<CodeSnippet data={JSON.stringify(data.user, null, 2)} />

	<div class="flex gap-2">
		<Button onclick={refetch}>
			<LucideRefreshCw class="mr-2 h-4 w-4" />
			Invalidate Data
		</Button>
		<form class="inline-flex" method="post" action="/auth?/logout">
			<Button
				type="submit"
				onclick={() => {
					isLoadingSignOut = true;
				}}
			>
				{#if isLoadingSignOut}
					<LucideLoaderCircle class="mr-2 h-4 w-4 animate-spin" />
				{:else}
					<LucideLogOut class="mr-2 h-4 w-4" />
				{/if}
				Sign Out
			</Button>
		</form>
	</div>
</div>
