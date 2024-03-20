<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import UserIcon from './UserIcon.svelte';
	import Exit from 'svelte-radix/Exit.svelte';
	import { enhance } from '$app/forms';

	export let username: string;
</script>

<!-- @component
- Signout redirect is at '/' so when signout is clicked
the page will have to be manually refreshed to see
the logged out state.
 -->

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Avatar.Root class="border-2">
			<Avatar.Image src="" alt="@shadcn" />
			<Avatar.Fallback>
				<UserIcon />
			</Avatar.Fallback>
		</Avatar.Root>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-72 rounded-lg">
		<DropdownMenu.Group>
			<DropdownMenu.Label class="m-0 flex flex-col px-2 py-3 text-base">
				<span class="font-semibold">{username}</span>
				<span class="m-0 font-normal text-muted-foreground">{username.toLowerCase()}@email.com</span
				>
			</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<form method="post" action="/?/logout" use:enhance>
				<button
					class="relative flex select-none items-center gap-x-6 rounded-sm px-2 px-2 py-1.5 py-3 text-base text-sm text-muted-foreground outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50"
				>
					<Exit size={20} />
					<span>Sign out</span>
				</button>
			</form>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
