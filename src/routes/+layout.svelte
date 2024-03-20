<script>
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import ModeToggle from '$lib/components/ModeToggle/ModeToggle.svelte';
</script>

<ModeWatcher />
<slot />

<!-- <ModeToggle /> -->
