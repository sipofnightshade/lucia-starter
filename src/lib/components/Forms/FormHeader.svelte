<script lang="ts">
	export let title: string;
	export let description: string;
</script>

<div>
	<h1 class="text-xl font-bold">{title}</h1>
	<p class="mt-px text-sm leading-tight text-muted-foreground">
		{description}
	</p>
</div>
