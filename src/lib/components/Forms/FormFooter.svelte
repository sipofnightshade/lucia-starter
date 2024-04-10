<script lang="ts">
	export let type: 'login' | 'signup';
</script>

<div class="mt-4 flex gap-x-1 text-sm">
	{#if type === 'login'}
		<p class="text-muted-foreground">Don't have an account yet?</p>
		<a href="/signup" class="text-accent-foreground">Signup</a>
	{:else if type === 'signup'}
		<p class="text-muted-foreground">Already have an account?</p>
		<a href="/login" class="text-accent-foreground">Login</a>
	{/if}
</div>
