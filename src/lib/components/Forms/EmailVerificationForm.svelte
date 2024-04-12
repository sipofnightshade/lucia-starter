<script lang="ts">
	// components
	import * as Form from '$lib/components/ui/form';
	import { toast } from 'svelte-sonner';
	import Spinner from '$lib/Icons/Spinner.svelte';
	import { Input } from '$lib/components/ui/input';
	//sveltekit
	import type { SubmitFunction } from '@sveltejs/kit';
	import { enhance } from '$app/forms';
	// superforms
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import {
		emailVerificationCodeSchema,
		type EmailVerificationCodeSchema
	} from '$lib/validation/authSchema';
	import { zodClient } from 'sveltekit-superforms/adapters';
	// other
	import { mediaQuery } from 'svelte-legos';

	// props
	export let data: SuperValidated<Infer<EmailVerificationCodeSchema>>;

	// verify email form handling
	const form = superForm(data, {
		validators: zodClient(emailVerificationCodeSchema),
		resetForm: false,
		delayMs: 500,
		timeoutMs: 8000,
		taintedMessage: null,
		onUpdated: () => {
			if (!$message) return;
			const { status, text } = $message;
			if (status === 'error') toast.error(text);
			if (status === 'success') toast.success(text);
		}
	});

	const { form: formData, message, delayed, timeout } = form;

	// resend code button callback
	const resendFunction: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type === 'failure') {
				toast.error(result.data?.message);
			}

			if (result.type === 'success') {
				toast.success(result.data?.message);
			}
		};
	};

	const isDesktop = mediaQuery('(min-width: 640px)');
</script>

<!-- verify email -->
<form
	class="flex flex-col gap-y-2"
	method="POST"
	action="/email-verification?/verifyCode"
	autocomplete="off"
	use:enhance
>
	<Form.Field {form} name="verificationCode">
		<Form.Control let:attrs>
			<Input {...attrs} bind:value={$formData.verificationCode} />
		</Form.Control>
	</Form.Field>
	<Form.Button disabled={$delayed || $timeout}>
		{#if $delayed || $timeout}
			<Spinner class="mr-1 h-5 w-5" />
		{:else}
			<span>Verify email</span>
		{/if}
	</Form.Button>
</form>

<!-- resend code -->
<form
	class="flex flex-col gap-y-2"
	method="POST"
	action="/email-verification?/sendNewCode"
	use:enhance={resendFunction}
>
	<Form.Button variant="ghost">Resend Code</Form.Button>
</form>
