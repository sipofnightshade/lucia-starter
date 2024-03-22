<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { toast } from 'svelte-sonner';
	import AuthBadge from '$lib/components/Forms/AuthBadge.svelte';
	import FormHeader from '$lib/components/Forms/FormHeader.svelte';
	import { Input } from '$lib/components/ui/input';

	import {
		emailVerificationCodeSchema,
		type EmailVerificationCodeSchema
	} from '$lib/validation/authSchema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { mediaQuery } from 'svelte-legos';
	import { enhance } from '$app/forms';

	export let data: SuperValidated<Infer<EmailVerificationCodeSchema>>;
	export let showBadge: boolean = false;
	export let showContainer: boolean = false;

	// form handling
	const form = superForm(data, {
		validators: zodClient(emailVerificationCodeSchema),
		resetForm: false,
		taintedMessage: null,
		onUpdated: () => {
			if (!$message) return;

			const { alertType, alertText } = $message;

			if (alertType === 'error') {
				toast.error(alertText);
			}
		}
	});

	const { form: formData, enhance: verifyCodeEnhance, errors, message, delayed } = form;

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
		use:verifyCodeEnhance
	>
		<Form.Field {form} name="verificationCode">
			<Form.Control let:attrs>
				<Input {...attrs} bind:value={$formData.verificationCode} />
			</Form.Control>
			<Form.FieldErrors>{$errors.verificationCode}</Form.FieldErrors>
		</Form.Field>
		<Form.Button disabled={$delayed}>Verify email</Form.Button>
	</form>

	<!-- resend code -->
	<form
		class="flex flex-col gap-y-2"
		method="POST"
		action="/email-verification?/sendNewCode"
		use:enhance
	>
		<Form.Button variant="ghost">Resend Code</Form.Button>
	</form>
</div>
