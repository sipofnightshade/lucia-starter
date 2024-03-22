<script>
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
</script>

<ModeWatcher />
<Toaster richColors />
<slot />

<style lang="postcss">
	:global(body) {
		color: theme(colors.foreground);
		background: theme(colors.background);
	}
</style>
