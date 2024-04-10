<script lang="ts">
	// Third-Party Library Imports
	import { mediaQuery } from 'svelte-legos';
	import AuthBadge from '$lib/components/Forms/AuthBadge.svelte';

	export let showBadge: boolean = false;

	const isDesktop = mediaQuery('(min-width: 640px)');
	$: showFormContainer = $isDesktop;
</script>

<div
	class="relative flex w-full max-w-96 flex-col gap-y-4 rounded-2xl bg-background p-8 sm:w-96 {showFormContainer &&
		'border shadow-xl'}"
>
	{#if showBadge && showFormContainer}
		<AuthBadge />
	{/if}

	<!-- render form and other components -->
	<slot />
</div>
