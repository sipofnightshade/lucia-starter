<script lang="ts">
	import type { PageData } from './$types.js';
	import LoginForm from '$lib/components/Forms/LoginForm.svelte';
	export let data: PageData;
</script>

<div class="flex h-svh w-screen items-center justify-center bg-background">
	<LoginForm data={data.form} showBadge showContainer />
</div>
