<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();

	function refetch() {
		console.log("refetching");
		invalidate((url) => {
			console.log("invalidation url", url);
			return true;
		});
		invalidateAll();
	}
</script>

<p>
	{JSON.stringify(data.user)}
</p>

<Button onclick={refetch}>
	Invalidate Data
</Button>
