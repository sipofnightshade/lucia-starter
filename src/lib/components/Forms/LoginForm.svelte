<script lang="ts">
	// Third-Party Library Imports
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	// Components
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import Spinner from '$lib/Icons/Spinner.svelte';
	// Validation
	import { loginSchema, type LoginSchema } from '$lib/validation/authSchema';

	export let data: SuperValidated<Infer<LoginSchema>>;

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
</script>

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

	<Form.Button disabled={$delayed || $timeout}>
		{#if $delayed || $timeout}
			<Spinner class="mr-1 h-5 w-5" />
		{:else}
			<span>Login</span>
		{/if}
	</Form.Button>
</form>
