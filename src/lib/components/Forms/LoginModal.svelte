<script lang="ts">
	// Components
	import LoginForm from '$lib/components/Forms/LoginForm.svelte';
	import FormFooter from '$lib/components/Forms/FormFooter.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import OAuthButtons from '$lib/components/Forms/OAuthButtons.svelte';
	import Divider from '$lib/components/Forms/Divider.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	// Validations
	import { type LoginSchema } from '$lib/validation/authSchema';
	import { type SuperValidated, type Infer } from 'sveltekit-superforms';

	// props
	export let data: SuperValidated<Infer<LoginSchema>>;
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Login</Dialog.Trigger>
	<Dialog.Content
		class="flex w-full max-w-96 flex-col gap-y-4 !rounded-2xl bg-background p-8 sm:w-96"
	>
		<Dialog.Header class="relative">
			<Dialog.Title>Login</Dialog.Title>
			<Dialog.Description>Choose your preferred login method!</Dialog.Description>
		</Dialog.Header>

		<OAuthButtons />
		<Divider />

		<LoginForm {data} />
		<FormFooter type="login" />
	</Dialog.Content>
</Dialog.Root>
