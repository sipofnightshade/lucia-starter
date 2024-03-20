<script lang="ts">
	import LoginModal from '$lib/components/Forms/LoginModal.svelte';
	import SignupModal from '$lib/components/Forms/SignupModal.svelte';
	import { Button } from '$lib/components/ui/button';

	import type { PageData } from './$types';

	export let data: PageData;
	const { loginForm, signupForm } = data;
</script>

<div class="mb-4 flex gap-x-4">
	<a href="/signup">Signup</a>
	<a href="/login">Login</a>
</div>

<Button>
	<LoginModal data={loginForm} />
</Button>
<Button>
	<SignupModal data={signupForm} />
</Button>
