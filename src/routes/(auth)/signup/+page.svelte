<script lang="ts">
	import type { PageData } from './$types.js';
	import SignupForm from '$lib/components/Forms/SignupForm.svelte';
	export let data: PageData;
</script>

<div class="flex h-screen w-screen items-center justify-center bg-background">
	<SignupForm data={data.form} showBadge />
</div>
