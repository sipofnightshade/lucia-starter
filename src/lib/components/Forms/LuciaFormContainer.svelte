<script lang="ts">
	// Third-Party Library Imports
	import { mediaQuery } from 'svelte-legos';
	import AuthBadge from '$lib/components/Forms/AuthBadge.svelte';
	import { cn } from '$lib/utils.js';

	export let showBadge: boolean = false;

	const isDesktop = mediaQuery('(min-width: 640px)');
	$: showFormContainer = $isDesktop;
</script>

<div
	class={cn(
		`relative flex w-full max-w-96 flex-col gap-y-4 rounded-2xl bg-background p-8 sm:w-96 sm:border sm:shadow-lg ${$$props.class}`
	)}
>
	{#if showBadge && showFormContainer}
		<AuthBadge />
	{/if}

	<!-- render form and other components -->
	<slot />
</div>
