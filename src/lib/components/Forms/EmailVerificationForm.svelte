<script lang="ts">
	// components
	import * as Form from '$lib/components/ui/form';
	import { toast } from 'svelte-sonner';
	import AuthBadge from '$lib/components/Forms/AuthBadge.svelte';
	import FormHeader from '$lib/components/Forms/FormHeader.svelte';
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
	export let showBadge: boolean = false;
	export let showContainer: boolean = false;

	// verify email form handling
	const form = superForm(data, {
		validators: zodClient(emailVerificationCodeSchema),
		resetForm: false,
		taintedMessage: null,
		onUpdated: () => {
			if (!$message) return;
			const { status, text } = $message;
			if (status === 'error') toast.error(text);
			if (status === 'success') toast.success(text);
		}
	});

	const { form: formData, message, delayed } = form;

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

	$: showFormContainer = $isDesktop && showContainer;
</script>

<div
	class="relative flex w-full max-w-96 flex-col gap-y-4 rounded-2xl bg-background p-8 sm:w-96 {showFormContainer &&
		'border shadow-xl'}"
>
	{#if showBadge && showFormContainer}
		<AuthBadge />
	{/if}

	<FormHeader title="Check your email" description="We sent a verification link to your email" />

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
		<Form.Button disabled={$delayed}>Verify email</Form.Button>
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
</div>
