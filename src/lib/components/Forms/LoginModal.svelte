<script lang="ts">
	// components
	import * as Form from '$lib/components/ui/form';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import Divider from '$lib/components/Forms/Divider.svelte';
	// superforms
	import { loginSchema, type LoginSchema } from '$lib/validation/authSchema';
	import { Google, Github } from '$lib/Icons';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	// props
	export let data: SuperValidated<Infer<LoginSchema>>;

	// form handling
	const form = superForm(data, {
		validators: zodClient(loginSchema)
	});
	const { form: formData, enhance } = form;
</script>

<Dialog.Root>
	<Dialog.Trigger>Login</Dialog.Trigger>
	<Dialog.Content
		class="flex w-full max-w-96 flex-col gap-y-4 !rounded-2xl bg-background p-8 sm:w-96"
	>
		<Dialog.Header class="relative">
			<Dialog.Title>Login</Dialog.Title>
			<Dialog.Description>Choose your preferred login method!</Dialog.Description>
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

		<form class="flex flex-col gap-y-2" action="/login" method="POST" use:enhance>
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
			<p>Don't have an account yet?</p>
			<a href="/login" class="text-accent-foreground">Register</a>
		</div>
	</Dialog.Content>
</Dialog.Root>
