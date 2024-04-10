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
	import { signupSchema, type SignupSchema } from '$lib/validation/authSchema';

	export let data: SuperValidated<Infer<SignupSchema>>;
	export let showBadge: boolean = false;

	// form handling
	const form = superForm(data, {
		validators: zodClient(signupSchema),
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
	$: showFormContainer = $isDesktop;
</script>

<div
	class="relative flex w-full max-w-96 flex-col gap-y-4 rounded-2xl bg-background p-8 sm:w-96 {showFormContainer &&
		'border shadow-xl'}"
>
	{#if showBadge && showFormContainer}
		<AuthBadge />
	{/if}

	<FormHeader title="Create your account" description="Join with your preferred social account!" />
	<OAuthButtons />
	<Divider />

	<form class="flex flex-col gap-y-2" method="POST" use:enhance>
		<!-- name -->
		<Form.Field {form} name="name">
			<Form.Control let:attrs>
				<Form.Label>Full Name</Form.Label>
				<Input {...attrs} bind:value={$formData.name} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

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
			<span>Submit</span>
		</Form.Button>
	</form>

	<div class="mt-4 flex gap-x-1 text-sm">
		<p class="text-muted-foreground">Already have an account?</p>
		<a href="/login" class="text-accent-foreground">Login</a>
	</div>
</div>
