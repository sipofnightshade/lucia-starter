<script>
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
</script>

<ModeWatcher />
<slot />

<style lang="postcss">
	:global(body) {
		color: theme(colors.foreground);
		background: theme(colors.background);
	}
</style>
