import { ADMIN_PASSWORD } from '$env/static/private';
import type { ServerLoadEvent } from '@sveltejs/kit';

export function load({ cookies }: ServerLoadEvent) {
	const logged = cookies.get('logged') === ADMIN_PASSWORD;
	return { logged };
}
