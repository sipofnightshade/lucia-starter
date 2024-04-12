<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Input } from '$lib/components/ui/input';
	import * as Form from '$lib/components/ui/form';
	import * as Avatar from '$lib/components/ui/avatar';
	import FormHeader from '$lib/components/Forms/FormHeader.svelte';
	import LuciaFormContainer from '$lib/components/Forms/LuciaFormContainer.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';
	import { getInitials } from '$lib/utils/getInitials';
	import { editAccountSchema } from '$lib/validation/authSchema';
	import { Google, Github } from '$lib/Icons';
	import LinkedOAuthButton from '$lib/components/Forms/LinkedOAuthButton.svelte';

	export let data: PageData;
	const { name, email, avatarUrl, authMethods } = data.user;

	// const form = superForm(data.form, {
	// 	validators: zodClient(editAccountSchema)
	// });
	// const { form: formData, enhance } = form;

	$: initials = getInitials(name);
</script>

<div class="flex h-svh w-screen items-center justify-center bg-background">
	<LuciaFormContainer class="gap-y-6">
		<FormHeader title="Account" description="Manage your account information." />
		<!-- Avatar -->
		<div class=" flex items-center gap-2">
			<Avatar.Root class="h-14 w-14 border-none">
				<Avatar.Image src={avatarUrl} alt="profile" />
				<Avatar.Fallback>
					<span class="font-bold tracking-wide">{initials}</span>
				</Avatar.Fallback>
			</Avatar.Root>
			<div>
				<h2 class="text-sm font-bold">Profile picture</h2>
				<p class="text-sm text-muted-foreground">Updated with social login.</p>
			</div>
		</div>

		<div class="flex flex-col gap-y-2">
			<!-- name -->
			<div class="flex flex-col gap-y-0.5">
				<p
					class="flex h-10 w-full items-center rounded-md border bg-muted px-2.5 text-muted-foreground"
				>
					{name}
				</p>
			</div>
			<!-- email -->
			<div class="flex flex-col gap-y-0.5">
				<p
					class="flex h-10 w-full items-center rounded-md border bg-muted px-2.5 text-muted-foreground"
				>
					{email}
				</p>
			</div>
		</div>
		<!-- Account Linking -->
		<div class="flex flex-col gap-y-2">
			<div class="mb-1">
				<h2 class="text-sm font-bold">Account Linking</h2>
				<p class="text-sm text-muted-foreground">Link social accounts for extra security.</p>
			</div>

			<div class="flex gap-x-3">
				<LinkedOAuthButton type="google" {authMethods}>
					<Google />
				</LinkedOAuthButton>
				<LinkedOAuthButton type="github" {authMethods}>
					<Github />
				</LinkedOAuthButton>
			</div>
		</div>
		<!-- Delete Account -->
	</LuciaFormContainer>
</div>
