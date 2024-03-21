<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { signupSchema, type SignupSchema } from '$lib/validation/authSchema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button';
	import { Google, Github } from '$lib/Icons';
	import Divider from '$lib/components/Forms/Divider.svelte';

	import { mediaQuery } from 'svelte-legos';

	export let data: SuperValidated<Infer<SignupSchema>>;
	export let showBadge: boolean = false;

	// form handling
	const form = superForm(data, {
		validators: zodClient(signupSchema)
	});
	const { form: formData, enhance } = form;

	const isDesktop = mediaQuery('(min-width: 640px)');
	$: showFormContainer = $isDesktop;
</script>

<div
	class="relative flex w-full max-w-96 flex-col gap-y-4 rounded-2xl bg-background p-8 sm:w-96 {showFormContainer &&
		'border shadow-xl'}"
>
	{#if showBadge && showFormContainer}
		<div
			class="absolute -left-[76px] top-24 -rotate-90 rounded-t-md bg-accent-foreground px-3 py-1"
		>
			<p class="flex gap-x-1.5 text-xs tracking-wide text-background">
				<span>Protected by</span>
				<strong class="text-accent">lucia</strong>
			</p>
		</div>
	{/if}
	<div>
		<h1 class="text-xl font-bold">Create your account</h1>
		<p class="mt-px text-sm leading-tight text-muted-foreground">
			Join with your preferred social account!
		</p>
	</div>

	<section>
		<Button variant="outline" class="h-12 w-12 p-3">
			<Google />
		</Button>
		<Button variant="outline" class="h-12 w-12 p-3">
			<Github class="dark:strok-red-500" />
		</Button>
	</section>

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
		<Form.Button>Submit</Form.Button>
	</form>

	<div class="mt-4 flex gap-x-1 text-sm">
		<p class="text-muted-foreground">Already have an account?</p>
		<a href="/login" class="text-accent-foreground">Login</a>
	</div>
</div>