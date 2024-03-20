<script lang="ts">
	// components
	import * as Form from '$lib/components/ui/form';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import Divider from '$lib/components/Forms/Divider.svelte';
	// superforms
	import { signupSchema, type SignupSchema } from '$lib/validation/authSchema';
	import { Google, Github } from '$lib/Icons';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	// props
	export let data: SuperValidated<Infer<SignupSchema>>;

	// form handling
	const form = superForm(data, {
		validators: zodClient(signupSchema)
	});
	const { form: formData, enhance } = form;
</script>

<Dialog.Root>
	<Dialog.Trigger>Signup</Dialog.Trigger>
	<Dialog.Content
		class="flex w-full max-w-96 flex-col gap-y-4 !rounded-2xl bg-background p-8 sm:w-96"
	>
		<Dialog.Header class="relative">
			<Dialog.Title>Create your account</Dialog.Title>
			<Dialog.Description>Join with your preferred social account!</Dialog.Description>
		</Dialog.Header>

		<section>
			<Button variant="outline" class="h-12 w-12 p-3">
				<Google />
			</Button>
			<Button variant="outline" class="h-12 w-12 p-3">
				<Github class="dark:strok-red-500" />
			</Button>
		</section>

		<Divider />

		<form class="flex flex-col gap-y-2" action="/signup" method="POST" use:enhance>
			<!-- username -->
			<Form.Field {form} name="username">
				<Form.Control let:attrs>
					<Form.Label>Username</Form.Label>
					<Input {...attrs} bind:value={$formData.username} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- password -->
			<Form.Field {form} name="password">
				<Form.Control let:attrs>
					<Form.Label>Password</Form.Label>
					<Input {...attrs} bind:value={$formData.password} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button>Submit</Form.Button>
		</form>

		<div class="mt-4 flex gap-x-1 text-sm">
			<p class="text-muted-foreground">Already have an account?</p>
			<a href="/login" class="text-accent-foreground">Login</a>
		</div>
	</Dialog.Content>
</Dialog.Root>
