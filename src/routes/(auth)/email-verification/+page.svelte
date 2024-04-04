<script lang="ts">
	import type { PageData } from './$types.js';
	import EmailVerificationForm from '$lib/components/Forms/EmailVerificationForm.svelte';

	export let data: PageData;
</script>

<div class="flex h-svh w-screen items-center justify-center bg-background">
	<EmailVerificationForm data={data.form} showBadge showContainer />
</div>
