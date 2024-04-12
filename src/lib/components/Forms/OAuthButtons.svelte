<script lang="ts">
	import { Google, Github } from '$lib/Icons';
	import { Button } from '$lib/components/ui/button';
</script>

<section class={$$props.class}>
	<Button href="/login/google" variant="outline" class="h-12 w-12 p-2.5">
		<Google />
	</Button>
	<Button href="/login/github" variant="outline" class="h-12 w-12 p-2.5">
		<Github />
	</Button>
</section>
