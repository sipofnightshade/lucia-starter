<script lang="ts">
	// Third-Party Library Imports
	import { cn } from '$lib/utils.js';
</script>

<div
	class={cn(
		`relative flex w-full max-w-96 flex-col gap-y-4 rounded-2xl bg-background p-8 sm:w-96 sm:border sm:shadow-lg ${$$props.class}`
	)}
>
	<!-- render form and other components -->
	<slot />
</div>
