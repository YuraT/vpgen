export function opnsenseSanitezedUsername(username: string) {
	return username.slice(0, 63).replace(/[^a-zA-Z0-9_-]/g, '_');
}
