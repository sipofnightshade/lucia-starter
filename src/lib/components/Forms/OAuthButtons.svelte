<script lang="ts">
	import { Google, Github } from '$lib/Icons';
	import { Button } from '$lib/components/ui/button';
</script>

<section>
	<Button href="/login/google" variant="outline" class="h-12 w-12 p-3">
		<Google />
	</Button>
	<Button href="/login/github" variant="outline" class="h-12 w-12 p-3">
		<Github class="dark:strok-red-500" />
	</Button>
</section>
