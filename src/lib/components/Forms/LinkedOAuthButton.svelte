<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Link2 from 'lucide-svelte/icons/link-2';

	export let type: 'google' | 'github';
	export let authMethods: string[];

	$: isAuthMethod = authMethods.includes(type);
</script>

<Button
	href="/login/{type}"
	variant="outline"
	class="relative h-12 w-12 rounded-xl p-2.5 {isAuthMethod &&
		'pointer-events-none border-2 border-primary hover:bg-none'} "
>
	<slot />
	{#if isAuthMethod}
		<Link2 class="absolute -bottom-3 text-primary" strokeWidth="2.5" size="22" />
	{/if}
</Button>
