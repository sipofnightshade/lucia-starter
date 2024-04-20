<script lang="ts">
	import type { PageData } from './$types.js';
	import LoginForm from '$lib/components/Forms/LoginForm.svelte';
	import Divider from '$lib/components/Forms/Divider.svelte';
	import FormHeader from '$lib/components/Forms/FormHeader.svelte';
	import FormFooter from '$lib/components/Forms/FormFooter.svelte';
	import LuciaFormContainer from '$lib/components/Forms/LuciaFormContainer.svelte';
	import OAuthButtons from '$lib/components/Forms/OAuthButtons.svelte';
	export let data: PageData;
</script>

<div class="flex h-svh w-screen items-center justify-center bg-background">
	<LuciaFormContainer>
		<FormHeader title="Login" description="Choose your preferred login method!" />
		<OAuthButtons />
		<Divider />
		<LoginForm data={data.form} />
		<FormFooter type="login" />
	</LuciaFormContainer>
</div>
