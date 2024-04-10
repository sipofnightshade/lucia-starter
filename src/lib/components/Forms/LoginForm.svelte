<script lang="ts">
	// Third-Party Library Imports
	import { mediaQuery } from 'svelte-legos';
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	// Components
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import AuthBadge from '$lib/components/Forms/AuthBadge.svelte';
	import FormHeader from '$lib/components/Forms/FormHeader.svelte';
	import Divider from '$lib/components/Forms/Divider.svelte';
	import OAuthButtons from '$lib/components/Forms/OAuthButtons.svelte';
	import Spinner from '$lib/Icons/Spinner.svelte';
	// Validation
	import { loginSchema, type LoginSchema } from '$lib/validation/authSchema';

	export let data: SuperValidated<Infer<LoginSchema>>;
	export let showBadge: boolean = false;
	export let showContainer: boolean = false;

	// form handling
	const form = superForm(data, {
		validators: zodClient(loginSchema),
		delayMs: 500,
		timeoutMs: 8000,
		onUpdated: () => {
			if (!$message) return;
			const { status, text } = $message;
			if (status === 'error') toast.error(text);
			if (status === 'success') toast.success(text);
		}
	});
	const { form: formData, enhance, delayed, timeout, message } = form;

	const isDesktop = mediaQuery('(min-width: 640px)');
	$: showFormContainer = $isDesktop && showContainer;
</script>

<div
	class="relative flex w-full max-w-96 flex-col gap-y-4 rounded-2xl bg-background p-8 sm:w-96 {showFormContainer &&
		'border shadow-xl'}"
>
	{#if showBadge && showFormContainer}
		<AuthBadge />
	{/if}

	<FormHeader title="Login" description="Choose your preferred login method!" />
	<OAuthButtons />
	<Divider />

	<form class="flex flex-col gap-y-2" method="POST" use:enhance>
		<!-- email -->
		<Form.Field {form} name="email">
			<Form.Control let:attrs>
				<Form.Label>Email</Form.Label>
				<Input {...attrs} bind:value={$formData.email} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- password -->
		<Form.Field {form} name="password">
			<Form.Control let:attrs>
				<Form.Label>Password</Form.Label>
				<Input type="password" {...attrs} bind:value={$formData.password} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Button>
			{#if $delayed || $timeout}
				<Spinner class="mr-1 h-5 w-5" />
			{/if}
			<span>Login</span>
		</Form.Button>
	</form>

	<div class="mt-4 flex gap-x-1 text-sm">
		<p class="text-muted-foreground">Don't have an account yet?</p>
		<a href="/signup" class="text-accent-foreground">Signup</a>
	</div>
</div>
