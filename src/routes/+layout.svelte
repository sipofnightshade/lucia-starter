<script>
	import { Toaster } from '$lib/components/ui/sonner';
	import ShowTWBreakpoints from '$lib/components/ShowTWBreakpoints.svelte';
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
</script>

<ModeWatcher />
<Toaster richColors />
<slot />

<!-- Show tailwind breakpoints -->
<ShowTWBreakpoints />

<style lang="postcss">
	:global(body) {
		color: theme(colors.foreground);
		background: theme(colors.background);
	}
</style>
