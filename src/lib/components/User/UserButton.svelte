<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import UserIcon from './UserIcon.svelte';
	import Exit from 'svelte-radix/Exit.svelte';
	import { enhance } from '$app/forms';
	import type { User } from 'lucia';

	export let user: User;

</script>

<!-- @component
- Signout redirect is at '/' so when signout is clicked
the page will have to be manually refreshed to see
the logged out state.
 -->

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Avatar.Root class="border-2">
			<Avatar.Image src={user.avatarUrl} alt="profile" />
			<Avatar.Fallback>
				<UserIcon />
			</Avatar.Fallback>
		</Avatar.Root>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-72 rounded-lg">
		<DropdownMenu.Group>
			<DropdownMenu.Label class="m-0 px-2 py-3 text-base">
				<p class="font-semibold">{user.name}</p>
				<p class="m-0 text-sm font-normal text-muted-foreground">{user.email.toLowerCase()}</p>
			</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<form method="post" action="/signout" use:enhance>
				<button
					type="submit"
					class="relative flex w-full select-none items-center gap-x-4 rounded-sm px-2 py-3 text-base text-muted-foreground outline-none transition-colors hover:bg-muted data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50"
				>
					<Exit size={20} />
					<span>Sign out</span>
				</button>
			</form>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
