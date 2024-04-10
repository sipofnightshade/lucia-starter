<script lang="ts">
	import type { PageData } from './$types.js';
	import EmailVerificationForm from '$lib/components/Forms/EmailVerificationForm.svelte';
	import FormHeader from '$lib/components/Forms/FormHeader.svelte';
	import LuciaFormContainer from '$lib/components/Forms/LuciaFormContainer.svelte';
	export let data: PageData;
</script>

<div class="flex h-svh w-screen items-center justify-center bg-background">
	<!-- <EmailVerificationForm data={data.form} showBadge showContainer /> -->

	<LuciaFormContainer showBadge>
		<FormHeader title="Check your email" description="We sent a verification link to your email" />
		<EmailVerificationForm data={data.form} />
	</LuciaFormContainer>
</div>
