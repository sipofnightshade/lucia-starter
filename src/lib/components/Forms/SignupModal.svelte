<script lang="ts">
	// Components
	import * as Dialog from '$lib/components/ui/dialog';
	import FormFooter from '$lib/components/Forms/FormFooter.svelte';
	import SignupForm from '$lib/components/Forms/SignupForm.svelte';
	import OAuthButtons from '$lib/components/Forms/OAuthButtons.svelte';
	import Divider from '$lib/components/Forms/Divider.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	// Validation
	import { type SignupSchema } from '$lib/validation/authSchema';
	import { type SuperValidated, type Infer } from 'sveltekit-superforms';

	export let data: SuperValidated<Infer<SignupSchema>>;
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Signup</Dialog.Trigger>
	<Dialog.Content
		class="flex w-full max-w-96 flex-col gap-y-4 !rounded-2xl bg-background p-8 sm:w-96"
	>
		<Dialog.Header class="relative">
			<Dialog.Title>Create your account</Dialog.Title>
			<Dialog.Description>Join with your preferred social account!</Dialog.Description>
		</Dialog.Header>

		<OAuthButtons />
		<Divider />

		<SignupForm {data} />
		<FormFooter type="signup" />
	</Dialog.Content>
</Dialog.Root>
