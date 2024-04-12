export function getInitials(name: string): string {
	// Split the name into words
	const words = name.split(' ');

	// Handle single-word names
	if (words.length === 1) {
		return name.charAt(0).toUpperCase();
	}
	// Handle names with two words
	else if (words.length === 2) {
		const firstInitial = words[0].charAt(0).toUpperCase();
		const lastInitial = words[1].charAt(0).toUpperCase();
		return firstInitial + lastInitial;
	}
	// Handle names with more than two words
	else {
		const firstInitial = words[0].charAt(0).toUpperCase();
		const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
		return firstInitial + lastInitial;
	}
}
