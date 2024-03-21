<script lang="ts">
	import LoginModal from '$lib/components/Forms/LoginModal.svelte';
	import SignupModal from '$lib/components/Forms/SignupModal.svelte';
	import UserButton from '$lib/components/User/UserButton.svelte';
	import { Button } from '$lib/components/ui/button';
	import ModeToggle from '$lib/components/ModeToggle/ModeToggle.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
	const { loginForm, signupForm, user } = data;
</script>

<div class="m-16 flex flex-col gap-8">
	{#if !user}
		<div>
			<h2 class="font-semibold">Links</h2>

			<Button href="/signup" variant="outline">Signup</Button>
			<Button href="/login" variant="outline">Login</Button>
		</div>

		<div>
			<h2 class="font-semibold">Modal Buttons</h2>
			<Button>
				<LoginModal data={loginForm} />
			</Button>
			<Button>
				<SignupModal data={signupForm} />
			</Button>
		</div>
	{/if}

	{#if user}
		<div>
			<h2 class="font-semibold">User Button</h2>
			<UserButton {user} />
		</div>
	{/if}

	<div>
		<h2 class="font-semibold">Mode Toggle</h2>
		<ModeToggle />
	</div>
</div>
